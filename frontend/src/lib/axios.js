import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development"
        ? "http://localhost:5001/api"
        : "/api", // Replace with your actual backend URL
    withCredentials: true, // This allows cookies to be sent
});
