import { useEffect, useState } from "react";
import { History, CheckCircle, Edit, PlusCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";

// Matches the backend AuditLog schema we engineered
interface AuditLog {
  _id: string;
  action: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'DELETED';
  performedBy: { name: string; email: string };
  changes?: Record<string, any>;
  createdAt: string;
}

const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default function OrderTimeline({ orderId }: { orderId: string }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLogs([]);
      setError("This order does not have a valid ID.");
      setIsLoading(false);
      return;
    }

    let isActive = true;
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get(`/audit-logs/${orderId}`);
        if (isActive) {
          setLogs(response.data.data ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch order timeline", error);
        if (isActive) {
          setError("Unable to load the audit timeline.");
          setLogs([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchLogs();
    return () => {
      isActive = false;
    };
  }, [orderId]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED': return <PlusCircle className="h-4 w-4 text-emerald-500" />;
      case 'STATUS_CHANGED': return <CheckCircle className="h-4 w-4 text-indigo-500" />;
      case 'UPDATED': return <Edit className="h-4 w-4 text-blue-500" />;
      default: return <History className="h-4 w-4 text-slate-500" />;
    }
  };

  if (isLoading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;
  }

  if (error) {
    return <div className="py-8 text-center text-sm text-red-500">{error}</div>;
  }

  if (logs.length === 0) {
    return <div className="text-center text-sm text-slate-500 py-8">No timeline events recorded.</div>;
  }

  return (
    <ScrollArea className="mt-2 h-[calc(100vh-9rem)] max-h-[620px] px-4">
      <div className="relative space-y-5 py-2 pl-8 before:absolute before:bottom-0 before:left-3 before:top-0 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
        {logs.map((log) => (
          <div key={log._id} className="relative flex min-w-0 items-start gap-3">
            <div className="absolute -left-8 top-3 z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-slate-100 shadow-sm dark:border-slate-900 dark:bg-slate-800">
              {getActionIcon(log.action)}
            </div>

            <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="text-sm font-semibold capitalize text-slate-900 dark:text-white">
                  {log.action.replace('_', ' ').toLowerCase()}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatTimestamp(log.createdAt)}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Action by <span className="font-medium text-slate-900 dark:text-white">{log.performedBy?.name || "System"}</span>
              </p>

              {log.changes && Object.keys(log.changes).length > 0 && (
                <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 dark:border-slate-700">
                  {Object.entries(log.changes).map(([key, value]) => (
                    <div key={key} className="break-words text-xs">
                      <span className="capitalize text-slate-500 dark:text-slate-400">{key}:</span>{" "}
                      <span className="font-medium text-slate-700 dark:text-slate-200">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}