import { updateOrderStatus } from "@/features/orders/orderSlice";
import type { RootState } from "@/store/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {io} from 'socket.io-client'


const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ;


export const useSocket = ()=>{
    const dispatch = useDispatch();
    const user = useSelector((state: RootState)=> state.auth.user);

    useEffect(()=>{
        if(!user) return;

        const socket = io(SOCKET_URL, {
            withCredentials: true
        })

        //join the socket room we defined in the backend
        socket.emit('join_dashboard', 'admin_dashboard');

        socket.on('orderStatusUpdate', (data:{orderId: string, status: 'Pending'| 'In Progress' | 'Completed'})=>{
            dispatch(updateOrderStatus({orderId: data.orderId, newStatus: data.status}));
        });

        return ()=>{
            socket.disconnect();
        };

    }, [dispatch, user])
}