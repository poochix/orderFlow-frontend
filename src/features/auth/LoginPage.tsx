import { useState } from "react";
import { useDispatch } from "react-redux"
import {useNavigate}  from 'react-router-dom'
import {useForm} from 'react-hook-form'
import {type LoginFormValue, loginSchema } from "./authSchema";
import {zodResolver} from '@hookform/resolvers/zod'
import { api } from "@/lib/axios";
import { setCredentials } from "./authSlice";





export default LoginPage(){
   
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

                //the browser automatically stores http-Only cookies sent back in this response
                const response = await api.post('/auth/login', data);

                //update global state with user data 
                dispatch(setCredentials(response.data.data));
                navigate('/dashboard')
                
            } catch (error :any) {
                setServerError({
                    error.response?.data?.messsage || "Invalid credentials or server error"
                })
                
            }
        }

    return(

    )
}