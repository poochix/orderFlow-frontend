import { useSocket } from "@/hooks/useSocket";
import type { RootState } from "@/store/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setOrders } from "./orderSlice";
import { api } from "@/lib/axios";

import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";



export default function OrdersPage(){
    const dispatch = useDispatch()
    const {orders, isLoading} = useSelector((state: RootState)=> state.order)

    //initializes socker
    useSocket();

    useEffect(()=>{
     const fetchOrders = async()=>  { 
        try {
            dispatch(setLoading(true));
            const response = await api.get('/getOrders?page=1&limit=10')
            dispatch(setOrders({
                orders: response.data.data,
                total: response.data.pagination.totalOrders
            }));

        } catch (error) {
            console.error('failed to fetch orders', error)
            
        } finally{
            dispatch(setLoading(false));
        }
    };

    fetchOrders();

    },[dispatch]);

    const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'In Progress': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-amber-500 hover:bg-amber-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Shared Order Pool</h2>
        <p className="text-sm text-slate-500">Live operational dashboard. Statuses update in real-time.</p>
      </div>

      <div className="rounded-md border bg-white dark:border-slate-800 dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">No orders found.</TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.customer?.companyName || "Unknown"}</TableCell>
                  <TableCell>{order.productName}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}