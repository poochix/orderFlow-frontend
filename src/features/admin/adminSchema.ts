import { z } from "zod";

export const addEmployeeSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Temporary password must be at least 6 characters." }),
  role: z.enum(["admin", "manager", "staff"], {
    required_error: "Please select a role.",
  }),
});

export type AddEmployeeFormValues = z.infer<typeof addEmployeeSchema>;