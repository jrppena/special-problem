import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useApprovalStore = create((set, get) => ({
  pendingUsers: [],
  loading: false,
  totalUsers: 0,
  currentPage: 1,
  itemsPerPage: 5,
  isShowingAll: false,

  // Set pagination options
  setPage: (page) => set({ currentPage: page }),
  setShowAll: (value) => set({ isShowingAll: value }),
  
  // Fetch pending users with pagination
  fetchPendingUsers: async (userType = "All") => {
    const { currentPage, itemsPerPage, isShowingAll } = get();
    set({ loading: true });
    
    try {
      let url = "/admin/pending-users";
      
      // Add pagination parameters if not showing all
      if (!isShowingAll) {  
        url += `?page=${currentPage}&limit=${itemsPerPage}`;
      } else {
        url += "?showAll=true";
      }
      
      // Add filter by userType if specified
      if (userType !== "All") {
        url += `${isShowingAll || currentPage ? "&" : "?"}role=${userType}`;
      }
      
      const response = await axiosInstance.get(url);
      
      set({ 
        pendingUsers: response.data.users,
        totalUsers: response.data.totalCount
      });
    } catch (error) {
      console.error("Error fetching pending users:", error);
      toast.error("Failed to load users");
    } finally {
      set({ loading: false });
    }
  },

  // Verify User
  verifyUser: async (userId, isVerified) => {
    try {
      await axiosInstance.post(`/admin/verify/${userId}`, { isVerified });
      
      // Re-fetch the current page to update the UI
      const { fetchPendingUsers } = get();
      await fetchPendingUsers();
      
      toast.success(`User ${isVerified ? "approved" : "disapproved"} successfully`);
    } catch (error) {
      toast.error("Error verifying user");
      console.error("Error verifying user:", error);
    }
  },
}));