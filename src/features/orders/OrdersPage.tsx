import { useSocket } from "@/hooks/useSocket";
import type { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setOrders } from "./orderSlice";
import { api } from "@/lib/axios";

import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import CreateOrderModal from "./CreateOrderModal";
import OrderTimeline from "./OrderTimeline";

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
    return (
      customers.find((item) => item._id === customer)?.companyName ||
      "Unknown"
    );
  }

  if (customer.companyName) {
    return customer.companyName;
  }

  return (
    customers.find((item) => item._id === customer._id)?.companyName ||
    customer.name ||
    "Unknown"
  );
}

export default function OrdersPage() {
  const dispatch = useDispatch();

  const { orders, isLoading } = useSelector(
    (state: RootState) => state.order
  );

  const [customers, setCustomers] = useState<
    { _id: string; companyName: string }[]
  >([]);

  // Stores the dispatch input for each order
  const [dispatchInputs, setDispatchInputs] = useState<
    Record<string, string>
  >({});

  // Track which order is currently being dispatched
  const [dispatchingOrderId, setDispatchingOrderId] = useState<string | null>(
    null
  );

  // Initializes socket
  useSocket();

  // Fetch customers
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

  // Fetch orders
  const fetchOrders = async () => {
    try {
      dispatch(setLoading(true));

      const response = await api.get(
        "/orders/getOrders?page=1&limit=10"
      );

      dispatch(
        setOrders({
          orders: response.data.data,
          total: response.data.pagination.totalOrders,
        })
      );
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [dispatch]);

  // Status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500 hover:bg-emerald-600";

      case "In Progress":
        return "bg-blue-500 hover:bg-blue-600";

      case "Cancelled":
        return "bg-red-500 hover:bg-red-600";

      case "On Hold":
        return "bg-orange-500 hover:bg-orange-600";

      default:
        return "bg-amber-500 hover:bg-amber-600";
    }
  };

  // Calculate total dispatched quantity
  const getDispatchedQuantity = (order: any) => {
    return (
      order.dispatch_Qty?.reduce(
        (total: number, qty: number) => total + qty,
        0
      ) ?? 0
    );
  };

  // Calculate pending quantity
  const getPendingQuantity = (order: any) => {
    const dispatchedQty = getDispatchedQuantity(order);

    return Math.max(order.quantity - dispatchedQty, 0);
  };

  // Dispatch order
  const handleDispatch = async (orderId: string) => {
    const inputValue = dispatchInputs[orderId];

    const dispatchQty = Number(inputValue);

    if (!inputValue || dispatchQty <= 0) {
      alert("Please enter a valid dispatch quantity.");
      return;
    }

    const order = orders.find((item) => item._id === orderId);

    if (!order) {
      return;
    }

    const pendingQty = getPendingQuantity(order);

    if (dispatchQty > pendingQty) {
      alert(`Only ${pendingQty} quantity is pending.`);
      return;
    }

    try {
      setDispatchingOrderId(orderId);

      await api.post(`/orders/${orderId}/dispatch`, {
        dispatchQty,
      });

      // Clear input after successful dispatch
      setDispatchInputs((previous) => ({
        ...previous,
        [orderId]: "",
      }));

      // Refresh orders
      await fetchOrders();
    } catch (error: any) {
      console.error("Failed to dispatch order", error);

      alert(
        error?.response?.data?.message ||
          "Failed to dispatch order."
      );
    } finally {
      setDispatchingOrderId(null);
    }
  };

  // Order status update
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
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
          Shared Order Pool
        </h2>

        <p className="text-sm text-slate-500 dark:text-white">
          Live operational dashboard. Statuses update in real-time.
        </p>
      </div>

      {/* Create order */}
      <CreateOrderModal onSuccess={fetchOrders} />

      {/* Orders table */}
      <div className="overflow-x-auto rounded-md border bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white">
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Thickness</TableHead>
              <TableHead>Width</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Dispatch</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="h-24 text-center"
                >
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="h-24 text-center text-slate-800 dark:text-white"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                // const dispatchedQty = getDispatchedQuantity(order);

                const pendingQty = getPendingQuantity(order);

                const isDispatching =
                  dispatchingOrderId === order._id;

                return (
                  <TableRow key={order._id}>
                    {/* Order Number + Timeline */}
                    <TableCell>
                      <Sheet>
                        <SheetTrigger
                          render={
                            <button className="cursor-pointer font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                              {order.orderNumber}
                            </button>
                          }
                        />

                        <SheetContent className="text-slate-800 dark:text-white sm:max-w-[500px]">
                          <SheetHeader>
                            <SheetTitle>
                              Order {order.orderNumber}
                            </SheetTitle>

                            <SheetDescription>
                              Immutable audit timeline and lifecycle
                              history.
                            </SheetDescription>
                          </SheetHeader>

                          <OrderTimeline
                            orderId={order._id}
                          />
                        </SheetContent>
                      </Sheet>
                    </TableCell>

                    {/* Company */}
                    <TableCell className="font-medium">
                      {getCompanyName(
                        order.customer,
                        customers
                      )}
                    </TableCell>

                    {/* Product */}
                    <TableCell>
                      {order.productName}
                    </TableCell>

                    {/* Thickness */}
                    <TableCell>
                      {order.thickness || "-"}
                    </TableCell>

                    {/* Width */}
                    <TableCell>
                      {order.width || "-"}
                    </TableCell>

                    {/* Quantity */}
                    <TableCell className="font-medium">
                      {order.quantity}
                    </TableCell>

                    {/* Deadline */}
                    <TableCell>
                      {order.deadline
                        ? new Date(
                            order.deadline
                          ).toLocaleDateString()
                        : "—"}
                    </TableCell>

                    {/* Dispatch */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={pendingQty}
                          value={
                            dispatchInputs[order._id] ?? ""
                          }
                          disabled={
                            pendingQty === 0 || isDispatching
                          }
                          onChange={(e) =>
                            setDispatchInputs(
                              (previous) => ({
                                ...previous,
                                [order._id]:
                                  e.target.value,
                              })
                            )
                          }
                          placeholder="Qty"
                          className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800"
                        />

                        <button
                          type="button"
                          disabled={
                            pendingQty === 0 ||
                            isDispatching
                          }
                          onClick={() =>
                            handleDispatch(order._id)
                          }
                          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDispatching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Dispatch"
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Pending */}
                    <TableCell>
                      <span
                        className={
                          pendingQty === 0
                            ? "font-semibold text-emerald-600 dark:text-emerald-400"
                            : "font-semibold text-orange-600 dark:text-orange-400"
                        }
                      >
                        {pendingQty}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(
                            order._id,
                            e.target.value as OrderStatus
                          )
                        }
                        className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}




// import { useSocket } from "@/hooks/useSocket";
// import type { RootState } from "@/store/store";
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { setLoading, setOrders } from "./orderSlice";
// import { api } from "@/lib/axios";

// import { Loader2 } from "lucide-react";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// // import { Badge } from "@/components/ui/badge";
// import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// import CreateOrderModal from "./CreateOrderModal";
// import OrderTimeline from "./OrderTimeline";


// type OrderStatus =
//   | "Pending"
//   | "In Progress"
//   | "Completed"
//   | "On Hold"
//   | "Cancelled";

// const ORDER_STATUSES: OrderStatus[] = [
//   "Pending",
//   "In Progress",
//   "Completed",
//   "On Hold",
//   "Cancelled",
// ];

// function getCompanyName(
//   customer: string | { _id?: string; name?: string; companyName?: string },
//   customers: { _id: string; companyName: string }[],
// ) {
//   if (typeof customer === "string") {
//     return customers.find((item) => item._id === customer)?.companyName || "Unknown";
//   }

//   if (customer.companyName) {
//     return customer.companyName;
//   }

//   return customers.find((item) => item._id === customer._id)?.companyName || customer.name || "Unknown";
// }



// export default function OrdersPage(){
//     const dispatch = useDispatch()
//     const {orders, isLoading} = useSelector((state: RootState)=> state.order) // Fixed to state.orders based on standard slice setup
//   const [customers, setCustomers] = useState<{ _id: string; companyName: string }[]>([])

//     //initializes socker
//     useSocket();

//     useEffect(() => {
//       const fetchCustomers = async () => {
//         try {
//           const response = await api.get("/customers");
//           setCustomers(response.data.data ?? []);
//         } catch (error) {
//           console.error("Failed to fetch customers", error);
//         }
//       };

//       fetchCustomers();
//     }, []);

//     const fetchOrders = async () => {
//       try {
//         dispatch(setLoading(true));
//         const response = await api.get("/orders/getOrders?page=1&limit=10");
//         dispatch(setOrders({ 
//           orders: response.data.data, 
//           total: response.data.pagination.totalOrders 
//         }));
//       } catch (error) {
//         console.error("Failed to fetch orders", error);
//       } finally {
//         dispatch(setLoading(false));
//       }
//     };

//     useEffect(() => {
//       fetchOrders();
//     }, [dispatch]);

//     const getStatusColor = (status: string) => {
//     switch(status) {
//       case 'Completed': return 'bg-emerald-500 hover:bg-emerald-600';
//       case 'In Progress': return 'bg-blue-500 hover:bg-blue-600';
//       default: return 'bg-amber-500 hover:bg-amber-600';
//     }
//   };


// //order status update
// const updateOrderStatus = async (
//   orderId: string,
//   status: OrderStatus
// ) => {
//   try {
//     await api.patch(`/orders/${orderId}/status`, {
//       status,
//     });

//     await fetchOrders();
//   } catch (error) {
//     console.error("Failed to update order status", error);
//   }
// };

//   return (
//     <div className="space-y-6 ">
//       <div>
//         <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Shared Order Pool</h2>
//         <p className="text-sm text-slate-500 dark:text-white">Live operational dashboard. Statuses update in real-time.</p>
//       </div>
//       {/*Injects the manual creation modal here */} 
//       <CreateOrderModal onSuccess={fetchOrders} />

//       <div className="rounded-md border bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Order #</TableHead>
//               <TableHead>Customer</TableHead>
//               <TableHead>Product</TableHead>
//               <TableHead>Qty</TableHead>
//               <TableHead>Deadline</TableHead>
//               <TableHead>Status</TableHead>

//             </TableRow>
//           </TableHeader>
//           <TableBody className="">
//             {isLoading ? (
//               <TableRow>
//                 <TableCell colSpan={6} className="h-24 text-center">
//                   <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
//                 </TableCell>
//               </TableRow>
//             ) : orders.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={6} className="h-24  text-center text-slate-800 dark:text-white">No orders found.</TableCell>
//               </TableRow>
//             ) : (
//               orders.map((order) => (
//                 <TableRow key={order._id}>
                  
//                   {/* 🚀 Slide-out trigger injected into the Order # Cell */}
//                   <TableCell className="font-medium">
//                     <Sheet>
//                       <SheetTrigger 
//                          render={ <button className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer">
//                           {order.orderNumber}
//                         </button>}
//                       />
                       
                      
//                       <SheetContent className="sm:max-w-[500px] text-slate-800 dark:text-white">
//                         <SheetHeader>
//                           <SheetTitle>Order {order.orderNumber}</SheetTitle>
//                           <SheetDescription>Immutable audit timeline and lifecycle history.</SheetDescription>
//                         </SheetHeader>
//                         <OrderTimeline orderId={order._id} />
//                       </SheetContent>
//                     </Sheet>
//                   </TableCell>

//                   <TableCell>{getCompanyName(order.customer, customers)}</TableCell>
//                   <TableCell>{order.productName}</TableCell>
//                   <TableCell>{order.quantity}</TableCell>
//                   <TableCell>{order.deadline ? new Date(order.deadline).toLocaleDateString() : 'Deadline not found'}</TableCell>

//                  <TableCell>
//                   <select
//                     value={order.status}
//                     onChange={(e) =>
//                       updateOrderStatus(
//                         order._id,
//                         e.target.value as OrderStatus
//                       )
//                     }
//                     className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${getStatusColor(order.status)}`}
//                   >
//                     {ORDER_STATUSES.map((status) => (
//                       <option key={status} value={status}>
//                         {status}
//                       </option>
//                     ))}
//                   </select>
//                 </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }



// import { useSocket } from "@/hooks/useSocket";
// import type { RootState } from "@/store/store";
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { setLoading, setOrders } from "./orderSlice";
// import { api } from "@/lib/axios";

// import { Loader2 } from "lucide-react";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";

// import CreateOrderModal from "./CreateOrderModal";


// type OrderStatus =
//   | "Pending"
//   | "In Progress"
//   | "Completed"
//   | "On Hold"
//   | "Cancelled";

//   const ORDER_STATUSES: OrderStatus[] = [
//   "Pending",
//   "In Progress",
//   "Completed",
//   "On Hold",
//   "Cancelled",
// ];

// function getCompanyName(
//   customer: string | { _id?: string; name?: string; companyName?: string },
//   customers: { _id: string; companyName: string }[],
// ) {
//   if (typeof customer === "string") {
//     return customers.find((item) => item._id === customer)?.companyName || "Unknown";
//   }

//   if (customer.companyName) {
//     return customer.companyName;
//   }

//   return customers.find((item) => item._id === customer._id)?.companyName || customer.name || "Unknown";
// }



// export default function OrdersPage(){
//     const dispatch = useDispatch()
//     const {orders, isLoading} = useSelector((state: RootState)=> state.order)
//   const [customers, setCustomers] = useState<{ _id: string; companyName: string }[]>([])

//     //initializes socker
//     useSocket();

//     useEffect(() => {
//       const fetchCustomers = async () => {
//         try {
//           const response = await api.get("/customers");
//           setCustomers(response.data.data ?? []);
//         } catch (error) {
//           console.error("Failed to fetch customers", error);
//         }
//       };

//       fetchCustomers();
//     }, []);

//     useEffect(()=>{
//      const fetchOrders = async()=>  { 
//         try {
//             dispatch(setLoading(true));
//             const response = await api.get('/orders/getOrders?page=1&limit=10')
//             dispatch(setOrders({
//                 orders: response.data.data,
//                 total: response.data.pagination.totalOrders
//             }));

//         } catch (error) {
//             console.error('failed to fetch orders', error)
            
//         } finally{
//             dispatch(setLoading(false));
//         }
//     };

//     fetchOrders();

//     },[dispatch]);

//     const getStatusColor = (status: string) => {
//     switch(status) {
//       case 'Completed': return 'bg-emerald-500 hover:bg-emerald-600';
//       case 'In Progress': return 'bg-blue-500 hover:bg-blue-600';
//       default: return 'bg-amber-500 hover:bg-amber-600';
//     }
//   };


//   //Extracts the data fetching logic into a standalone function inside the component so we can pass it down
// const fetchOrders = async () => {
//   try {
//     dispatch(setLoading(true));
//     const response = await api.get("/orders/getOrders?page=1&limit=10");
//     dispatch(setOrders({ 
//       orders: response.data.data, 
//       total: response.data.pagination.totalOrders 
//     }));
//   } catch (error) {
//     console.error("Failed to fetch orders", error);
//   } finally {
//     dispatch(setLoading(false));
//   }
// };

// useEffect(() => {
//   fetchOrders();
// }, [dispatch]);


// //order status update
// const updateOrderStatus = async (
//   orderId: string,
//   status: OrderStatus
// ) => {
//   try {
//     await api.patch(`/orders/${orderId}/status`, {
//       status,
//     });

//     await fetchOrders();
//   } catch (error) {
//     console.error("Failed to update order status", error);
//   }
// };

//   return (
//     <div className="space-y-6 text-white">
//       <div>
//         <h2 className="text-2xl font-bold tracking-tight text-white dark:text-white">Shared Order Pool</h2>
//         <p className="text-sm text-slate-500">Live operational dashboard. Statuses update in real-time.</p>
//       </div>

//       {/*Injects the manual creation modal here */}
//       <CreateOrderModal onSuccess={fetchOrders} />

//       <div className="rounded-md border bg-white dark:border-slate-800 dark:bg-slate-950">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Order #</TableHead>
//               <TableHead>Customer</TableHead>
//               <TableHead>Product</TableHead>
//               <TableHead>Qty</TableHead>
//               <TableHead>Deadline</TableHead>
//               <TableHead>Status</TableHead>

//             </TableRow>
//           </TableHeader>
//           <TableBody className="">
//             {isLoading ? (
//               <TableRow>
//                 <TableCell colSpan={5} className="h-24 text-center">
//                   <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
//                 </TableCell>
//               </TableRow>
//             ) : orders.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={5} className="h-24  text-center text-white">No orders found.</TableCell>
//               </TableRow>
//             ) : (
//               orders.map((order) => (
//                 <TableRow key={order._id}>
//                   <TableCell className="font-medium">{order.orderNumber}</TableCell>
//                   <TableCell>{getCompanyName(order.customer, customers)}</TableCell>
//                   <TableCell>{order.productName}</TableCell>
//                   <TableCell>{order.quantity}</TableCell>
//                   <TableCell>{order.deadline ? new Date(order.deadline).toLocaleDateString() : 'Deadline not found'}</TableCell>

//                  <TableCell>
//   <select
//     value={order.status}
//     onChange={(e) =>
//       updateOrderStatus(
//         order._id,
//         e.target.value as OrderStatus
//       )
//     }
//     className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${getStatusColor(order.status)}`}
//   >
//     {ORDER_STATUSES.map((status) => (
//       <option key={status} value={status}>
//         {status}
//       </option>
//     ))}
//   </select>
// </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }