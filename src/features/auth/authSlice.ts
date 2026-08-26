import {createSlice , type PayloadAction}  from '@reduxjs/toolkit'

interface User {
    id: string;
    name: string;
    email?: string;
    role: "admin" | "manager" | "staff";
}

interface AuthState{
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean; 

}

const initialState: AuthState = {
    user : null,
    isAuthenticated: false,
    isLoading: true,  //stays true while checking the  user's active session

}

const authSlice = createSlice({
     name: 'auth',
     initialState,
     reducers:{
        setCredentials: (state, action: PayloadAction<User>) =>{
            state.user= action.payload;
            state.isAuthenticated= true;
            state.isLoading= false;
        },

        logout: (state)=>{
            state.user = null;
            state.isAuthenticated=false;
            state.isLoading= false;
        },

        setLoading: (state, action: PayloadAction<boolean>)=>{
            state.isLoading= action.payload
        }
     }  

})

export const {setCredentials, logout, setLoading} = authSlice.actions;
export default authSlice.reducer;