import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2, { message: "Contact name is required." }),
  companyName: z.string().min(2, { message: "Company name is required." }),
  email: z.string().email({ message: "Valid email is required." }).optional(),
  phone: z.string().min(10, { message: "Valid phone number is required." }),
  address: z.string().min(5, { message: "Address is required." }),
  gstNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateCustomerFormValues = z.infer<typeof createCustomerSchema>;