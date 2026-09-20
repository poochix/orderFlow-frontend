import { useSocket } from "@/hooks/useSocket";
import type { RootState } from "@/store/store";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setOrders } from "./orderSlice";
import { api } from "@/lib/axios";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
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
import EditOrderModal from "./EditOrderModal";

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
  customer: string | { _id?: string; name?: string; companyName?: string },  // customer : id || {}
  customers: { _id: string; companyName: string }[],   // from fetchCustomers() -> setCustomers = state
): string {
  if (typeof customer === "string") {
    return (
      customers.find((item) => item._id === customer)?.companyName ??
      "Unknown"
    );
  }

  if (customer.companyName) {
    return customer.companyName;
  }

  return (
    customers.find((item) => item._id === customer._id)?.companyName ??
    customer.name ??
    "Unknown"
  );
}

export default function OrdersPage() {
  const dispatch = useDispatch();

  const { orders, isLoading } = useSelector(
    (state: RootState) => state.order,
  );

  const [customers, setCustomers] = useState<
    { _id: string; companyName: string }[]
  >([]);

  // Stores the dispatch input for each order
  const [dispatchInputs, setDispatchInputs] = useState<Record<string, string>>({});

  // Track which order is currently being dispatched
  const [dispatchingOrderId, setDispatchingOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

// tracking filtered status and company name for order filtration
  const [statusFilter, setStatusFilter] = useState<"All" | OrderStatus>("All")
  const [companyFilter, setCompanyFilter] = useState<string>("All");


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
const getDispatchedQuantity = (order: any): number => {
  const total =
    order.dispatchHistory?.reduce(
      (total: number, dispatch: any) =>
        total + Number(dispatch.quantity),
      0
    ) ?? 0;

  return Number(total.toFixed(2));
};

const getPendingQuantity = (order: any): number => {
  const dispatchedQty = getDispatchedQuantity(order);

  return Number(
    Math.max(order.quantity - dispatchedQty, 0).toFixed(2)
  );
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

    const dispatchedQty = getDispatchedQuantity(order);

const pendingQty = Math.max(
  order.quantity - dispatchedQty,
  0
);





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
    status: OrderStatus,
  ): Promise<void> => {
    try {
      await api.patch(`/orders/${orderId}/status`, {
        status,
      });

      await fetchOrders();
    } catch (error) {
      console.error("Failed to update order status", error);
    }
  };



  const filteredOrders = orders.filter((order)=>{    // .filter() heavily relies on the returned values as it converts it into boolean
    
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    
    const companyName = getCompanyName(order.customer, customers);

    const matchesCompany = companyFilter === "All" || companyName == companyFilter;

    return matchesStatus && matchesCompany
  })

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

<div className="flex items-center justify-center gap-4">

      <select
       value={companyFilter}
       onChange={(e)=> setCompanyFilter(e.target.value)}
       className="rounded-md border px-4 py-2 text-slate-800 dark:bg:slate-900 dark:text-white "
>
  <option value="All"  className="dark:bg-slate-900">All Companies</option>
  {customers.map((customer)=>(
    <option key={customer._id}
    value={customer.companyName}
    className="dark:bg-slate-900"
    >{customer.companyName}
       
       </option>
  ))}

      </select>

      <select value={statusFilter}
         onChange={(e)=> setStatusFilter(e.target.value as 'All' | OrderStatus)}
         className="rounded-md border px-4 py-2 text-slate-800 dark:bg:slate-900 dark:text-white "
      >
        <option value="All"  className="dark:bg-slate-900">
          All Status
        </option>
          {ORDER_STATUSES.map((status)=>(
          <option key={status}
             value={status}
             className="dark:bg-slate-900"
           >{status}
       
          </option>
  ))}
      </select>
  </div>

      {/* Orders table */}
      <div className="overflow-x-auto rounded-md  border bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white">
        <Table className="min-w-[1200px] ">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Order Number</TableHead>
              <TableHead className="text-center">Company</TableHead>
              <TableHead className="text-center">Product</TableHead>
              <TableHead className="text-center">Thickness</TableHead>
              <TableHead className="text-center">Width</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-center">Deadline</TableHead>
              <TableHead className="text-center">Dispatch</TableHead>
              <TableHead className="text-center">Pending</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">History</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="h-24 text-center"
                >
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="h-24 text-center text-slate-800 dark:text-white"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
               const pendingQty = getPendingQuantity(order);

                const isDispatching =
                  dispatchingOrderId === order._id;

                return (
                  <Fragment key={order._id} >
                    <TableRow >
                      {/* Order Number + Timeline */}
                      <TableCell className="text-center">
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

                            <OrderTimeline orderId={order._id} />
                          </SheetContent>
                        </Sheet>
                      </TableCell>

                      {/* Company */}
                      <TableCell className="font-medium text-center">
                        {getCompanyName(order.customer, customers)}
                      </TableCell>

                      {/* Product */}
                      <TableCell className="text-center">{order.productName}</TableCell>

                      {/* Thickness */}
                      <TableCell className="text-center">{order.thickness || "-"}</TableCell>

                      {/* Width */}
                      <TableCell className="text-center">{order.width || "-"}</TableCell>

                      {/* Quantity */}
                      <TableCell className="font-medium text-center">
                        {order.quantity}
                      </TableCell>

                      {/* Deadline */}
                      <TableCell className="text-center">
                        {order.deadline
                          ? new Date(order.deadline).toLocaleDateString()
                          : "—"}
                      </TableCell>

                      {/* Dispatch */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-around ">
                          <input
                            type="number"
                            min="1"
                            max={pendingQty}
                            value={dispatchInputs[order._id] ?? ""}
                            disabled={pendingQty === 0 || isDispatching}
                            onChange={(e) =>
                              setDispatchInputs((previous) => ({
                                ...previous,
                                [order._id]: e.target.value,
                              }))
                            }
                            placeholder="Qty"
                            className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800"
                          />

                          <button
                            type="button"
                            disabled={pendingQty === 0 || isDispatching}
                            onClick={() => handleDispatch(order._id)}
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
                      <TableCell className="text-center">
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
                      <TableCell className="text-center">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(
                              order._id,
                              e.target.value as OrderStatus,
                            )
                          }
                          className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={`${status} - 'a'`} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </TableCell>

                      {/* History */}
                      <TableCell className="text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOrderId(
                              expandedOrderId === order._id ? null : order._id,
                            )
                          }
                          className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View dispatch history"
                          aria-expanded={expandedOrderId === order._id}
                          aria-label="Toggle dispatch history"
                        >
                          {expandedOrderId === order._id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>
                       <TableCell className="text-center">
                            <EditOrderModal 
                              order={order}
                              onSuccess={fetchOrders}
                            />
                       </TableCell>

                    </TableRow>

                    {expandedOrderId === order._id && (
                      <TableRow>
                        <TableCell colSpan={12}>
                          <div className="px-6 py-4">
                            <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-white">
                              Dispatch History
                            </h3>

                            {Array.isArray(order.dispatchHistory) &&
                            order.dispatchHistory.length ? (
                              <div className="space-y-2">
                                {order.dispatchHistory.map(
                                  (dispatch: any, index: number) => (
                                    <div
                                      key={`${order._id}-${index}`}
                                      className="flex items-center justify-between rounded-md border bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
                                    >
                                      <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-white">
                                          #{index + 1} &nbsp; {dispatch.quantity}{" "}
                                          kgs
                                        </p>

                                        <p className="text-xs text-slate-500">
                                          {new Date(
                                            dispatch.dispatchedAt,
                                          ).toLocaleString()}
                                        </p>
                                      </div>

                                      <p className="text-sm text-slate-600 dark:text-slate-300">
                                        By {dispatch.dispatchedBy.name}
                                      </p>
                                    </div>
                                  ),
                                )}

                                <div className="mt-4 flex justify-between border-t pt-3 text-sm font-semibold dark:border-slate-700">
                                  <span>Total Dispatched</span>

                                  <span>
                                    {order.dispatchHistory.reduce(
                                      (total: number, dispatch: any) =>
                                        total + dispatch.quantity,
                                      0,
                                    )}{" "}
                                    kgs
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500">
                                No dispatches recorded yet.
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
