import { createSlice } from "@reduxjs/toolkit"

const rawuser = localStorage.getItem("tuser")

let parseduser = null;

if (rawuser){
    try {
        parseduser = JSON.parse(atob(rawuser))
        
    } catch (error) {
        console.log("Error at parsed user ",error)
        localStorage.removeItem("tuser")
    }
}

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: parseduser
    },
    reducers: {
        loginuser: (state, action) => {
            state.user = action.payload;
            const stringifyuser = JSON.stringify(action.payload)
            const encodeduser = btoa(stringifyuser)
            localStorage.setItem("tuser", encodeduser)
        },
        logoutuser:(state,action)=>{
            state.user = null
            localStorage.removeItem("tuser")
        }
    }
})

export const {loginuser , logoutuser} = authSlice.actions;
export default authSlice.reducer