import axios from "axios"

export const userapi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:2222/",
    withCredentials:true
})
