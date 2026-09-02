import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/axios";
import CreateCustomerModal from "./CreateCustomerModal"; // 🚀 Import the modal

interface Customer {
  _id: string;
  companyName?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 Wrap in useCallback to safely pass as a dependency/prop
  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/customers");
      setCustomers(response.data.data ?? []);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white dark:text-white">Customers</h2>
          <p className="text-sm text-slate-500">Manage the B2B clients linked to your orders.</p>
        </div>
        {/* 🚀 Inject the modal and pass the fetch function */}
        <CreateCustomerModal onSuccess={fetchCustomers} />
      </div>

      <div className="rounded-md border bg-white dark:border-slate-800 dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-white">No customers found.</TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell className="font-medium">{customer.companyName || "Unknown"}</TableCell>
                  <TableCell>{customer.name || "-"}</TableCell>
                  <TableCell>{customer.email || "-"}</TableCell>
                  <TableCell>{customer.phone || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}




// import { useEffect, useState } from "react";
// import { Loader2 } from "lucide-react";

// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { api } from "@/lib/axios";

// interface Customer {
//   _id: string;
//   companyName?: string;
//   name?: string;
//   email?: string;
//   phone?: string;
// }

// export default function CustomersPage() {
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchCustomers = async () => {
//       try {
//         const response = await api.get("/customers");
//         setCustomers(response.data.data ?? []);
//       } catch (error) {
//         console.error("Failed to fetch customers", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCustomers();
//   }, []);

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Customers</h2>
//         <p className="text-sm text-slate-500">Manage the customers linked to your orders.</p>
//       </div>

//       <div className="rounded-md border bg-white dark:border-slate-800 dark:bg-slate-950">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Company</TableHead>
//               <TableHead>Contact</TableHead>
//               <TableHead>Email</TableHead>
//               <TableHead>Phone</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {isLoading ? (
//               <TableRow>
//                 <TableCell colSpan={4} className="h-24 text-center">
//                   <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
//                 </TableCell>
//               </TableRow>
//             ) : customers.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={4} className="h-24 text-center text-slate-500">No customers found.</TableCell>
//               </TableRow>
//             ) : (
//               customers.map((customer) => (
//                 <TableRow key={customer._id}>
//                   <TableCell className="font-medium">{customer.companyName || "Unknown"}</TableCell>
//                   <TableCell>{customer.name || "-"}</TableCell>
//                   <TableCell>{customer.email || "-"}</TableCell>
//                   <TableCell>{customer.phone || "-"}</TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }
