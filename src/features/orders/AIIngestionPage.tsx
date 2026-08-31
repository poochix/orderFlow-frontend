import { useState } from "react";
import { api } from "@/lib/axios";
import { Bot, Sparkles, Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function AIIngestionPage() {
  const [rawText, setRawText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (rawText.length < 10) {
      setError("Please enter at least 10 characters to parse.");
      return;
    }
    
    try {
      setIsParsing(true);
      setError(null);
      // Hitting the stateless AI layer we built in the backend
      const response = await api.post("/ai/parse-order", { text: rawText });
      setParsedData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to parse order text.");
    } finally {
      setIsParsing(false);
    }
  };

  const submitToOrderPool = async () => {
    // This will eventually post the verified data to /api/orders
    alert("Human-in-the-loop verified! Ready to POST /api/orders.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Bot className="h-6 w-6 text-indigo-500" />
          AI Smart Order Ingestion
        </h2>
        <p className="text-sm text-slate-500">Paste unstructured messages from WhatsApp or Email to auto-generate an order.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Raw Input</CardTitle>
            <CardDescription>Paste the customer's raw message here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="e.g., Need 50 Steel pipes for Acme Corp by Dec 1st. Make it high priority..."
              className="min-h-[200px] resize-none"
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

        {/* Human-in-the-Loop Review Section */}
        <Card className={`${!parsedData ? 'opacity-50 pointer-events-none' : ''}`}>
          <CardHeader>
            <CardTitle className="text-lg">Parsed Order Preview</CardTitle>
            <CardDescription>Review the AI-generated payload before creating the order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Customer / Company</Label>
                <Input readOnly value={parsedData?.customerName || ""} />
              </div>
              <div className="space-y-1">
                <Label>Product</Label>
                <Input readOnly value={parsedData?.productName || ""} />
              </div>
              <div className="space-y-1">
                <Label>Quantity</Label>
                <Input readOnly value={parsedData?.quantity || ""} />
              </div>
              <div className="space-y-1">
                <Label>Priority</Label>
                <Input readOnly value={parsedData?.priority || ""} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea readOnly value={parsedData?.notes || ""} className="h-20 resize-none" />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="default" onClick={submitToOrderPool} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Approve & Create Order <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}