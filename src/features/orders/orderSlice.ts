import {type PayloadAction, createSlice} from '@reduxjs/toolkit'

export interface Order {
    _id: string;
    orderNumber: string;
    customer: {name:string, companyName: string};
    productName: string;
    status: 'Pending' |'In Progress' | 'Completed';
    createdAt: string;
}

interface OrderState {
    orders: Order[];
    totalOrders: number;
    isLoading: boolean;
}

const initialState: OrderState = {
    orders: [],
    totalOrders: 0,
    isLoading: true

}

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {

           setOrders: (state, action: PayloadAction<{orders: Order[], total: number}>)=>{
            state.orders = action.payload.orders;
            state.totalOrders= action.payload.total;
            state.isLoading= false;
           },

           updateOrderStatus: (state, action: PayloadAction<{orderId: string, newStatus: Order['status']}>)=>{
                 const order = state.orders.find(o=> o._id === action.payload.orderId);
               if(order){
                order.status = action.payload.newStatus;
               };
           },

           setLoading: (state, action: PayloadAction<boolean>)=>{
               state.isLoading = action.payload
           }
    }
})

export const {setOrders, updateOrderStatus, setLoading} = orderSlice.actions;
export default orderSlice.reducer;