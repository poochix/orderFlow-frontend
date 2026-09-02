import { z } from "zod";

export const createOrderSchema = z.object({
  customer: z.string().min(1, { message: "Please select a customer." }),
  productName: z.string().min(2, { message: "Product name is required." }),
  quantity: z.coerce.number().int().positive({ message: "Quantity must be a positive integer." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'], { required_error: "Please select a priority." }),
  deadline: z.string().min(1, { message: "Deadline is required." }),
  description: z.string().min(5, { message: "Description must be at least 5 characters." }),
});

export type CreateOrderFormValues = z.infer<typeof createOrderSchema>;