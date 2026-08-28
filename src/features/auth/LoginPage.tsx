import { useState } from "react";
import { useDispatch } from "react-redux"
import {useNavigate}  from 'react-router-dom'
import { useForm} from 'react-hook-form'
import {type LoginFormValue, loginSchema } from "./authSchema";
import {zodResolver} from '@hookform/resolvers/zod'
import { Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { setCredentials } from "./authSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";





export default function LoginPage(){
   
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [serverError , setServerError] = useState<string | null>(null);

    const form = useForm<LoginFormValue>({
        resolver: zodResolver(loginSchema),
        defaultValues: {email: "", password:""},
    });

        const onSubmit = async(data: LoginFormValue) =>{
            try {
                setServerError(null)

                // The backend sends the auth cookie in the response and returns the user payload.
                const response = await api.post('/auth/login', data);

                // Update global state with the authenticated user returned by the API.
                const user = response.data?.data ?? response.data?.user ?? {};
                dispatch(setCredentials(user));
                navigate('/dashboard');
                
            } catch (error :any) {
                // Surface the backend's exact message so the user can see why login failed.
                const message = error.response?.data?.message || "Invalid credentials or server error";
                setServerError(message);
            }
        }

    return(
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access OrderFlow</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {serverError && (
                <div className="text-sm font-medium text-destructive">{serverError}</div>
              )}

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>

    )
}