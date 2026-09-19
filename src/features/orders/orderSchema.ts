import { z } from "zod";

export const createOrderSchema = z.object({
  customer: z.string().min(1, { message: "Please select a customer." }),
  productName: z.string().min(2, { message: "Product name is required." }),
  thickness: z.string(),
  width: z.string(),
  quantity: z.coerce.number().int().positive({ message: "Quantity must be a positive integer." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'], { required_error: "Please select a priority." }),
  deadline: z.string().min(1, { message: "Deadline is required." }),
  description: z.string().min(5, { message: "Description must be at least 5 characters." }),
});


export const editOrderSchema = z.object({
    customer: z.string().length(24, { message: "Invalid Customer ID format" }).optional(),

    productName: z.string().trim().min(1, "Product Name is too short").optional(),

    thickness: z.string().trim().optional(),
    width: z.string().trim().optional(),
    description: z.string().trim().min(1, "Description lenght is too short").optional(),

    quantity: z
        .number()
        .int()
        .positive("Quantity must be positive Integer")
        .optional(),

    price: z
        .number()
        .nonnegative({ message: "Price cannot be negative" })

        .optional(),

    assignedEmployee: z
        .string()
        .length(24, {
            message: "Invalid Employee ID format",
        })
        .nullable()
        .optional(),

    priority: z
        .enum(["Low", "Medium", "High", "Urgent"])
        .optional(),

    deadline: z
        .string()
        .refine(
            (date) => !Number.isNaN(Date.parse(date)),
            {
                message: "Invalid deadline",
            }
        )
        .optional(),

}).strict()   // prevent client from injecting unapproved fields


export type CreateOrderFormValues = z.infer<typeof createOrderSchema>;
export type editOrderFormValues = z.infer< typeof editOrderSchema>;