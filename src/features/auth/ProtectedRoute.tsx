import type { RootState } from "@/store/store";
import {  Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";


interface ProtectedRoutesProps{
    allowedRoles?: Array<'admin' | 'manager' | 'staff'> ; 
}

export default function ProtectedRoutes({allowedRoles}: ProtectedRoutesProps) {

    const {isAuthenticated, isLoading , user} = useSelector((state: RootState)=> state.auth)

    //if still checking the session on the initial load
    if(isLoading){
        return(
            <div className="flex min-h-screen justify-center items-center bg-slate-50 dark:bg-slate-900">
                 <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        )
    };

    // kicks back to login if not authenticated
        if(!isAuthenticated || !user){
            return <Navigate to='/login' replace />
        }

        //RBAC check: kicks to unauthorized if role does not match with the required permissions
        if(allowedRoles && !allowedRoles.includes(user.role)){
            return <Navigate to='/orders' replace />  // or a dedicated 403 page
        }

        //renders the nested routes (e.g. dashboard)
        return <Outlet/>


            

}