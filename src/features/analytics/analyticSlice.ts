import { createSlice  , type PayloadAction} from "@reduxjs/toolkit";


export interface AnalyticsData {
    totalOrders: string;
    totalRevenue?: string;
    avgOrderValue?: string;
    overdueOrders: string;
    statusCounts: Record<string, number>;
}

interface AnalyticState {
    data : AnalyticsData | null;
    isLoading: boolean;
}

const initialState : AnalyticState={
    data : null,
    isLoading:true,

}

const analyticSlice = createSlice({

   name: "analytics",
   initialState,
   reducers: {
       setAnalytics: (state, action: PayloadAction<AnalyticsData>)=>{
           state.data = action.payload;
           state.isLoading = false;
       },

       setLoading: (state, action: PayloadAction<boolean>)=> {
          state.isLoading = action.payload
       }


   },

})

export const {setAnalytics, setLoading} = analyticSlice.actions;
export default analyticSlice.reducer