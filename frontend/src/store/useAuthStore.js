import {create} from "zustand";
import {axiosInstance} from "../lib/axios";
import toast from "react-hot-toast";
import {io} from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001":"/"

export const useAuthStore = create((set,get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: true,
    isUpdatingProfile: false,
    onlineUsers: [],
    socket:null,

    checkAuth: async () => {
        try{
            const response = await axiosInstance.get("/auth/check");
            set({authUser: response.data});
            get().connectSocket();
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

            get().connectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
            console.log("Error in login: ", error);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    updateProfile: async (data,imageData,didChangeImage) => {
        set({isUpdatingProfile: true});
        try{
            const response = await axiosInstance.put("/auth/update", data, imageData, didChangeImage);
            console.log("Response: ", response);


            await useAuthStore.getState().checkAuth();
            toast.success("Profile updated successfully");
        }catch(error){
            toast.error("Something went wrong");
            console.log("Error in updateProfile: ", error);
        }finally{
            set({isUpdatingProfile: false});
        }
    },
    
    logout: async () => {
        try{
            await axiosInstance.get("/auth/logout");
            set({authUser: null});
            toast.success("Logged out successfully");
            get().disconnectSocket();
        }catch(error){
            toast.error("Something went wrong");
            console.log("Error in logout: ", error);
        }
    },

    connectSocket:() => {
        const {authUser} = get();
        if(!authUser || get().socket?.connected || authUser.accountStatus != "Verified") return;
        const socket = io(BASE_URL,{
            query:{
                userId: authUser._id
            }
        });
        socket.connect();
        set({socket:socket});

        socket.on("getOnlineUsers", (userIds) => {
            set({onlineUsers: userIds});
        });

    },

    disconnectSocket:() => {
        if(get().socket?.connected){
            get().socket.disconnect();
        }

    }
    
}));