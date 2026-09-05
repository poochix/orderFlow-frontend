import { useSocket } from "@/hooks/useSocket";
import type { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setOrders } from "./orderSlice";
import { api } from "@/lib/axios";

import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import CreateOrderModal from "./CreateOrderModal";


type OrderStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Cancelled";

  const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];

function getCompanyName(
  customer: string | { _id?: string; name?: string; companyName?: string },
  customers: { _id: string; companyName: string }[],
) {
  if (typeof customer === "string") {
    return customers.find((item) => item._id === customer)?.companyName || "Unknown";
  }

  if (customer.companyName) {
    return customer.companyName;
  }

  return customers.find((item) => item._id === customer._id)?.companyName || customer.name || "Unknown";
}



export default function OrdersPage(){
    const dispatch = useDispatch()
    const {orders, isLoading} = useSelector((state: RootState)=> state.order)
  const [customers, setCustomers] = useState<{ _id: string; companyName: string }[]>([])

    //initializes socker
    useSocket();

    useEffect(() => {
      const fetchCustomers = async () => {
        try {
          const response = await api.get("/customers");
          setCustomers(response.data.data ?? []);
        } catch (error) {
          console.error("Failed to fetch customers", error);
        }
      };

      fetchCustomers();
    }, []);

    useEffect(()=>{
     const fetchOrders = async()=>  { 
        try {
            dispatch(setLoading(true));
            const response = await api.get('/orders/getOrders?page=1&limit=10')
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


  //Extracts the data fetching logic into a standalone function inside the component so we can pass it down
const fetchOrders = async () => {
  try {
    dispatch(setLoading(true));
    const response = await api.get("/orders/getOrders?page=1&limit=10");
    dispatch(setOrders({ 
      orders: response.data.data, 
      total: response.data.pagination.totalOrders 
    }));
  } catch (error) {
    console.error("Failed to fetch orders", error);
  } finally {
    dispatch(setLoading(false));
  }
};

useEffect(() => {
  fetchOrders();
}, [dispatch]);


//order status update
const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
) => {
  try {
    await api.patch(`/orders/${orderId}/status`, {
      status,
    });

    await fetchOrders();
  } catch (error) {
    console.error("Failed to update order status", error);
  }
};

  return (
    <div className="space-y-6 text-white">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white dark:text-white">Shared Order Pool</h2>
        <p className="text-sm text-slate-500">Live operational dashboard. Statuses update in real-time.</p>
      </div>

      {/*Injects the manual creation modal here */}
      <CreateOrderModal onSuccess={fetchOrders} />

      <div className="rounded-md border bg-white dark:border-slate-800 dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>

            </TableRow>
          </TableHeader>
          <TableBody className="">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24  text-center text-white">No orders found.</TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{getCompanyName(order.customer, customers)}</TableCell>
                  <TableCell>{order.productName}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{order.deadline ? new Date(order.deadline).toLocaleDateString() : 'Deadline not found'}</TableCell>

                 <TableCell>
  <select
    value={order.status}
    onChange={(e) =>
      updateOrderStatus(
        order._id,
        e.target.value as OrderStatus
      )
    }
    className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${getStatusColor(order.status)}`}
  >
    {ORDER_STATUSES.map((status) => (
      <option key={status} value={status}>
        {status}
      </option>
    ))}
  </select>
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