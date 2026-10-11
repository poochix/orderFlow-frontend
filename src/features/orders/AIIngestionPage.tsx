






import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { Bot, Sparkles, Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


/**
 * Normalizes company names before comparison.
 * Handles differences in capitalization, whitespace, and punctuation.
 */
const normalizeCompanyName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]/gu, "");
};


export default function AIIngestionPage() {
  const navigate = useNavigate();
  const [rawText, setRawText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Customer mapping states
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get("/customers");
        setCustomers(response.data.data);
      } catch (err) {
        console.error("Failed to load customers for mapping");
      }
    };
    fetchCustomers();
  }, []);

  const handleParse = async () => {
    if (rawText.trim().length < 10) {
      setError("Please enter at least 10 characters to parse.");
      return;
    }

    try {
      setIsParsing(true);
      setError(null);
      setParsedData(null);
      setSelectedCustomerId("");

      const response = await api.post("/ai/parse-order", {
        text: rawText,
      });
      console.log("response", response)

      const data = response.data.data;

      setParsedData(data);

      // Only attempt matching when the AI returns a company name.
      const aiCompanyName =
        typeof data.companyName === "string"
          ? data.companyName.trim()
          : "";

      // If the AI extracted a company name, match it against database customers.
      if (aiCompanyName) {
        const normalizedAIName = normalizeCompanyName(aiCompanyName);

        const matchedCustomer = customers.find((customer) => {
          const databaseCompanyName = normalizeCompanyName(
            customer.companyName ?? ""
          );

          return databaseCompanyName === normalizedAIName;
        });

        if (matchedCustomer) {
          // Select the verified customer using its MongoDB ID.
          setSelectedCustomerId(String(matchedCustomer._id));
        } else {
          // No verified match: let the user select manually.
          setSelectedCustomerId("");
        }
      } else {
        // No company name detected: let the user select manually.
        setSelectedCustomerId("");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to parse order text."
      );
    } finally {
      setIsParsing(false);
    }
  };

  const submitToOrderPool = async () => {
    if (!selectedCustomerId) {
      setError("You must link this order to a verified customer from the database.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Formatting the payload to strictly match our backend orderValidator.ts
      const orderPayload = {
        customer: selectedCustomerId,
        productName: parsedData.productName,
        thickness: parsedData.thickness,
        width: parsedData.width,
        // Fallback description length to pass Zod min(5) rule
        description: parsedData.notes?.length > 4 ? parsedData.notes : "AI Processed Order",
        quantity: parsedData.quantity,
        price: parsedData.price || 0, // Fallback if AI didn't catch a price
        priority: parsedData.priority || "Medium",
        deadline: parsedData.deadline || new Date().toISOString(),
      };

      await api.post("/orders/create", orderPayload);

      // Redirect to the shared pool where Socket.io is actively listening
      navigate("/orders");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <Bot className="h-6 w-6 text-indigo-500" />
          Smart Order
        </h2>
        <p className="text-sm text-slate-800 dark:text-white">Paste unstructured messages from WhatsApp or Email to auto-generate an order.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-800 dark:text-white">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Raw Input</CardTitle>
            <CardDescription>Paste the customer's raw message here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Need 50 Steel pipes for Acme Corp by Dec 1st. Make it high priority..."
              className="min-h-[200px] resize-none "
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button onClick={handleParse} disabled={isParsing || !rawText} className="w-full">
              {isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Extract Order Data
            </Button>
          </CardFooter>
        </Card>

        <Card className={`${!parsedData ? 'opacity-50 pointer-events-none' : ''}`}>
          <CardHeader>
            <CardTitle className="text-lg">Parsed Order Preview</CardTitle>
            <CardDescription>Review and map the AI data before creation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* <div className="space-y-1">
              <Label className="text-white font-semibold">Link to Verified Customer</Label>
              <Select value={selectedCustomerId} onValueChange={(value) => setSelectedCustomerId(value ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder={ "Select verified customer..."} > {parsedData?.companyName ?? parsedData.companyName : (customers.find((c)=> c._id===selectedCustomerId)?.companyName)}</SelectValue>
                </SelectTrigger>
                <SelectContent  className="bg-white text-slate-800 dark:text-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg z-50" >
                  {customers.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.companyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            <div className="space-y-1">
              <Label className="font-semibold">
                Link to Verified Customer
              </Label>

              <Select
                value={selectedCustomerId}
                onValueChange={(value) => setSelectedCustomerId(value ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select verified customer...">
                    {customers.find(
                      (customer) => String(customer._id) === String(selectedCustomerId)
                    )?.companyName ?? "Select verified customer..."}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent className="bg-white text-slate-800 dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-lg z-50">
                  {customers.map((customer) => (
                    <SelectItem
                      key={customer._id}
                      value={customer._id}
                    >
                      {customer.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Product</Label>
                <Input value={parsedData?.productName || ""} onChange={(e) => setParsedData({ ...parsedData, productName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Thickness</Label>
                <Input type="string" value={parsedData?.thickness || ""} onChange={(e) => setParsedData({ ...parsedData, thickness: (e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label>Width</Label>
                <Input type="string" value={parsedData?.width || ""} onChange={(e) => setParsedData({ ...parsedData, width: (e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label>Quantity</Label>
                <Input type="number" value={parsedData?.quantity || ""} onChange={(e) => setParsedData({ ...parsedData, quantity: parseInt(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label>Price</Label>
                <Input type="number" value={parsedData?.price || ""} onChange={(e) => setParsedData({ ...parsedData, price: (e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label>Deadline</Label>
                <Input type="date" value={parsedData?.deadline || ""} onChange={(e) => setParsedData({ ...parsedData, deadline: (e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label>priority</Label>
                <Input type="string" value={parsedData?.priority || ""} onChange={(e) => setParsedData({ ...parsedData, priority: (e.target.value) })} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Notes / Description</Label>
              <Textarea
                value={parsedData?.notes || ""}
                onChange={(e) => setParsedData({ ...parsedData, notes: e.target.value })}
                className="h-20 resize-none"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={submitToOrderPool} disabled={isSubmitting || !selectedCustomerId} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
              Approve & Create Order
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}








