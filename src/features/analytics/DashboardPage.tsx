import type { RootState } from "@/store/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAnalytics, setLoading } from "./analyticSlice";
import { api } from "@/lib/axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {  Package, AlertCircle, TrendingUp, Loader2 , IndianRupee} from "lucide-react";



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
            <div className="text-2xl font-bold">${data.totalRevenue?.toLocaleString() ?? 0}</div>
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
            <div className="text-2xl font-bold">${data.avgOrderValue?.toLocaleString() ?? 0}</div>
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
    </div>
  );

}