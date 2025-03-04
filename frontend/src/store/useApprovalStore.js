import { create } from "zustand";
import { axiosInstance } from "../lib/axios"; // ✅ Import axios instance
import toast from "react-hot-toast"; // ✅ Import toast

export const useApprovalStore = create((set) => ({
  pendingUsers: [],
  loading: false,

  // ✅ Fetch pending users (students & teachers)
  fetchPendingUsers: async () => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/admin/pending-users"); // Adjust API route
      set({ pendingUsers: response.data });
    } catch (error) {
      console.error("Error fetching pending users:", error);
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Verify User
  verifyUser: async (userId, isVerified) => {
    try {
      await axiosInstance.post(`/admin/verify/${userId}`, {isVerified});
      set((state) => ({
        pendingUsers: state.pendingUsers.filter((user) => user.id !== userId),
      }));
      toast.success("User verified successfully");
    } catch (error) {
        toast.error("Error verifying user");
        console.error("Error verifying user:", error);
    }
  },
}));
