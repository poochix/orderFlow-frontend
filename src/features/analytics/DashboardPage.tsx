import type { RootState } from "@/store/store";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAnalytics, setLoading } from "./analyticSlice";
import { api } from "@/lib/axios";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {  Package, AlertCircle, TrendingUp, Loader2 , IndianRupee} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";



export default function DashboardPage(){
    const dispatch = useDispatch()
    const {data, isLoading} = useSelector((state:RootState)=> state.analytics);

    useEffect(()=>{
        const fetchAnalytics = async ()=>{
            try {
                dispatch(setLoading(true));
                const response = await api.get('/analytics/dashboard');
                dispatch(setAnalytics(response.data.data));
                
            } catch (error) {
                console.error('failed to fetch analytics', error)
            } finally {
                dispatch(setLoading(false));
            }



        };
        fetchAnalytics();

    }, [dispatch]);

    // Convert the statusCounts object { "Pending": 5, "Completed": 10 } into a Recharts array
  const chartData = useMemo(() => {
    if (!data?.statusCounts) return [];
    return Object.entries(data.statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  }, [data]);

    if (isLoading || !data) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white dark:text-white">Analytics Overview</h2>
        <p className="text-sm text-slate-500">Live operational metrics and revenue tracking.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹ {data.totalRevenue?.toLocaleString() ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹ {data.avgOrderValue?.toLocaleString() ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Overdue Orders</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{data.overdueOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Chart Engine */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Order Distribution</CardTitle>
          <CardDescription>Current volume of orders broken down by workflow status.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="status" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.2)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

}