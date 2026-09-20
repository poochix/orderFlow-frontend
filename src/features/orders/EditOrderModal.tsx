import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { editOrderSchema, type editOrderFormValues } from "./orderSchema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import type { Order } from "./orderSlice";


interface EditOrderModalProps {
    order: Order;
    onSuccess: () => void;

}

interface Customer {
    _id: string;
    companyName: string;
}

export default function EditOrderModal({ order, onSuccess }: EditOrderModalProps) {
    
    useEffect(() => {
        console.log("EditOrderModal mounted");

        return () => {
            console.log("EditOrderModal unmounted");
        };
    }, []);
    const [isOpen, setIsOpen] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [serverError, setServerError] = useState<string | null>(null);
    const [quantityErrorOpen, setQuantityErrorOpen] = useState(false);

    // Safely extract the customer ID whether the backend populated it as an object or returned a string
    const customerId = typeof order.customer === 'object' ? order.customer?._id : order.customer;

    const getDefaultValues = (): editOrderFormValues => ({
        customer: customerId || "",
        productName: order.productName || "",
        thickness: order.thickness || "",
        width: order.width || "",
        quantity: order.quantity ?? 1,
        price: order.price ?? 0,
        priority: order.priority || "Medium",
        deadline: order.deadline
            ? new Date(order.deadline).toISOString().split("T")[0]
            : "",
        description: order.description || "",
    });

    const form = useForm<editOrderFormValues>({
        resolver: zodResolver(editOrderSchema),
        defaultValues: getDefaultValues()
    });

    // Re-sync form default values if the order prop changes (common in real-time dashboards)
    // useEffect(() => {
    //     if(isOpen){
    //         form.reset(getDefaultValues());
    //     }

    // }, [order._id, isOpen]);

    useEffect(() => {
        if (isOpen) {
            api.get("/customers").then(res => setCustomers(res.data.data)).catch(() => console.error("Failed to load customers"));
        }
    }, [isOpen]);

    const onSubmit = async (data: editOrderFormValues) => {
        if (
            data.quantity !== undefined &&
            data.quantity < order.dispatchedQty
        ) {
            setServerError(
                `Quantity cannot be less than ${order.dispatchedQty}, which has already been dispatched.`
            );
            return;
        }
        try {
            setServerError(null);
            // Ensure your backend is configured to accept PATCH or PUT at this endpoint
            await api.patch(`/orders/${order._id}`, data);
            setIsOpen(false);
            onSuccess();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setServerError(
                    error.response?.data?.message || "Failed to update order."
                );
            } else {
                setServerError("Failed to update order.");
            }
        }
    };

console.log("EDIT ORDER:", {
  orderId: order._id,
  dispatchedQty: order.dispatchedQty,
  dispatchHistory: order.dispatchHistory,
});
    return (
        <>
        
            <Dialog open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);

                //resets form to original value
                if (open) {
                    form.reset(getDefaultValues())
                }
                if (!open) {
                    form.reset()
                }

                //clears all errors
                setServerError(null);
                setQuantityErrorOpen(false)
            }}>
                <DialogTrigger
                    render={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                            <Edit className="h-4 w-4" />
                        </Button>
                    }
                />


                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Order {order.orderNumber}</DialogTitle>
                        <DialogDescription>Update the details for this order.</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-slate-900 dark:text-white">
                            <FormField control={form.control} name="customer" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a company" >
                                                    {customers.find(
                                                        (customer) => customer._id === field.value
                                                    )?.companyName}
                                                </SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent sideOffset={4} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-lg z-50">
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
                                    <FormItem><FormLabel>Product</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="thickness" render={({ field }) => (
                                    <FormItem><FormLabel>Thickness</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="width" render={({ field }) => (
                                    <FormItem><FormLabel>Width</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="quantity" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    console.log("INPUT VALUE:", value);

                                                    field.onChange(value === "" ? "" : Number(value))
                                                }} />
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground">
                                            Already dispatched: {order.dispatchedQty}
                                        </p>
                                        <FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="price" render={({ field }) => (
                                    <FormItem><FormLabel>Unit Price ( ₹ )</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} 
                                            onChange={(e) =>{
                                                 const value = e.target.value
                                                field.onChange(value==="" ? "" : Number(value))}} />
                                        </FormControl>
                                        <FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="deadline" render={({ field }) => (
                                    <FormItem><FormLabel>Deadline</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="priority" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                                            <SelectContent sideOffset={4} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-lg z-50">
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

                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={quantityErrorOpen}
                onOpenChange={setQuantityErrorOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Invalid Order Quantity
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            You have already dispatched{" "}
                            <strong>{order.dispatchedQty}</strong> units.
                            <br />
                            The order quantity cannot be less than the
                            dispatched quantity.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogAction>
                            Okay
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
    
}