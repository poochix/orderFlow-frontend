import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { createOrderSchema, type CreateOrderFormValues } from "./orderSchema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Customer {
  _id: string;
  companyName: string;
}

export default function CreateOrderModal({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customer: "", productName: "", quantity: 1, price: 0, priority: "Medium", deadline: "", description: ""
    },
  });

  useEffect(() => {
    if (isOpen) {
      api.get("/customers").then(res => setCustomers(res.data.data)).catch(() => console.error("Failed to load customers"));
    }
  }, [isOpen]);

  const onSubmit = async (data: CreateOrderFormValues) => {
    try {
      setServerError(null);
      await api.post("/orders/create", data);
      form.reset();
      setIsOpen(false);
      onSuccess(); // Triggers a table refresh in the parent component
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Failed to create order.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger >
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> New Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Manual Order</DialogTitle>
          <DialogDescription>Enter the order details directly into the shared pool.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-white">
            <FormField control={form.control} name="customer" render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                {/* Adding value={field.value} here to perfectly sync Radix UI with React Hook Form */}
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} >
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a company">
  {(value: string | null) => {
    const customer = customers.find(
      (c) => c._id === value
    );

    return customer?.companyName || "Select a company";
  }}
</SelectValue></SelectTrigger></FormControl>
                  <SelectContent   alignItemWithTrigger={false}  className="bg-white text-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg z-50" >
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="productName" render={({ field }) => (
                <FormItem><FormLabel>Product</FormLabel><FormControl><Input placeholder="e.g. Steel Pipes" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem><FormLabel>Unit Price ( ₹ )</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="deadline" render={({ field }) => (
                <FormItem><FormLabel>Deadline</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select  onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                    {/**dropdown positioning fixed */}
                    <SelectContent   alignItemWithTrigger={false} className="bg-white text-white  dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg z-50">
                      {['Low', 'Medium', 'High', 'Urgent'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Notes / Description</FormLabel><FormControl><Textarea className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            {serverError && <div className="text-sm font-medium text-destructive">{serverError}</div>}
            
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Order
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}