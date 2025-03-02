import {create} from "zustand";
import {axiosInstance} from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: true,

    checkAuth: async () => {
        try{
            const response = await axiosInstance.get("/auth/check");
            set({authUser: response.data});
        }catch(error){
            console.log("Error in checkAuth: ", error);
            set({authUser: null});
        }finally{
            set({isCheckingAuth: false});
        }
    },

    signup: async (data) => {
        set({isSigningUp: true});
        console.log("Data: ", data);
        try{
            const response = await axiosInstance.post("/auth/signup", data);
            set({authUser: response.data});
            toast.success("Account created successfully");
        }catch(error){
            toast.error(error.response.data.message);
            console.log("Error in signup: ", error);
        }finally{
            set({isSigningUp: false});
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
    
        try {
            const response = await axiosInstance.post("/auth/login", data);
    
            // ✅ Wait for checkAuth() to get the latest user state before setting authUser
            await useAuthStore.getState().checkAuth();
    
            toast.success("Logged in successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
            console.log("Error in login: ", error);
        } finally {
            set({ isLoggingIn: false });
        }
    },
    
    
    logout: async () => {
        try{
            await axiosInstance.get("/auth/logout");
            set({authUser: null});
            toast.success("Logged out successfully");
        }catch(error){
            toast.error("Something went wrong");
            console.log("Error in logout: ", error);
        }
    }
    
}));