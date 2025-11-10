import axios from "axios";

const http = axios.create ({
    baseURL: process.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    }
})

export default http;