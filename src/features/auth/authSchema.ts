import {z} from 'zod'

export const loginSchema = z.object({
    email: z.string().email({message: 'Please enter a valid email address.'}),
    password: z.string().min(6, {message:'Password must be atleat 6 characters long'})
})

export type LoginFormValue = z.infer<typeof loginSchema>;