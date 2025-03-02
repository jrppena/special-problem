import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development"
        ? "http://localhost:5001/api"
        : import.meta.env.VITE_APP_API_URL, // Replace with your actual backend URL
    withCredentials: true, // This allows cookies to be sent
});
