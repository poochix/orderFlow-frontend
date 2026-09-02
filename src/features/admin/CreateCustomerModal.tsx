import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { createCustomerSchema,  type CreateCustomerFormValues } from "./customerSchema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export default function CreateCustomerModal({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateCustomerFormValues>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: { name: "", companyName: "", email: "", phone: "", address: "", gstNumber: "", notes: "" },
  });

  const onSubmit = async (data: CreateCustomerFormValues) => {
    try {
      setServerError(null);
      await api.post("/customers/create", data);
      form.reset();
      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Failed to create customer.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger >
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Register New Customer</DialogTitle>
          <DialogDescription>Add a new B2B client to the CRM database.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="companyName" render={({ field }) => (
                <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="e.g. Apex Corp" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Primary Contact</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="contact@company.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="9999999999" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem><FormLabel>Billing Address</FormLabel><FormControl><Input placeholder="123 Industrial Park..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="gstNumber" render={({ field }) => (
              <FormItem><FormLabel>GST Number (Optional)</FormLabel><FormControl><Input placeholder="22AAAAA0000A1Z5" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Internal Notes</FormLabel><FormControl><Textarea className="resize-none" placeholder="Special requirements..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            {serverError && <div className="text-sm font-medium text-destructive">{serverError}</div>}
            
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Customer
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}