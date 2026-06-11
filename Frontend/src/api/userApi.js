import axios, {create} from "axios"

export const userapi = axios.create({
    baseURL:"http://localhost:2222/",
    withCredentials:true
})