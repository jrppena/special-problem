    import axios from "axios";

    export const axiosInstance = axios.create({
        baseURL: "http://localhost:5001",
        withCredentials: true, // This is to allow the frontend to send the cookie to the backend
    });


