    import axios from "axios";

    export const axiosInstance = axios.create({
        baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api": "/api",
        withCredentials: true, // This is to allow the frontend to send the cookie to the backend
    });


