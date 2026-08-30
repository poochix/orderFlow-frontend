import {configureStore} from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import orderReducer from '@/features/orders/orderSlice'

export const store = configureStore({
    reducer:{
        auth:authReducer,
        order: orderReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;