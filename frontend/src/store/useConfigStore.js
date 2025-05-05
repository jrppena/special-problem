import { create } from 'zustand';
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useConfigStore = create((get, set) => ({
    schoolYears: [],
    currentSchoolYear: null,
    isGettingSchoolYears: false,
    isGettingCurrentSchoolYear: false,

    fetchSchoolYears: async () => {
        set({ isGettingSchoolYears: true });
        try {
            const response = await axiosInstance.get("/config/get/school-years");
            console.log("School Years: ", response.data);
            set({ schoolYears: response.data.schoolYears });
            return response.data.schoolYears;
        } catch (error) {
            console.error("Error fetching school years:", error);
            toast.error("Failed to fetch school years.");
        } finally {
            set({ isGettingSchoolYears: false });
        }
    },

    fetchCurrentSchoolYear: async () => {
        set({ isGettingCurrentSchoolYear: true });
        try {
            const response = await axiosInstance.get("/config/get/current-school-year");
            console.log("Current School Year: ", response.data);
            set({ currentSchoolYear: response.data.currentSchoolYear });
            return response.data.currentSchoolYear;
        } catch (error) {
            console.error("Error fetching current school year:", error);
            toast.error("Failed to fetch current school year.");
        } finally {
            set({ isGettingCurrentSchoolYear: false });
        }
    },

    updateCurrentSchoolYear: async (currentSchoolYear) => {
        set({ isGettingSchoolYears: true });
        try {
            const response = await axiosInstance.put("/config/update/current-school-year", { currentSchoolYear });
            console.log("Update School Year Response: ", response.data);

            // Check if the update was successful
            if (response.data.success) {
                set({ currentSchoolYear: response.data.currentSchoolYear });
                toast.success("School year updated successfully!");
                return response.data.currentSchoolYear;
            }
            // Handle missing grades case
            else if (response.data.sections && response.data.sections.length > 0) {
                toast.error("Cannot update school year - missing grades detected");
                // Return the entire response for displaying in modal
                return response.data;
            }
            // Handle other failure cases
            else {
                toast.error(response.data.message || "Failed to update school year.");
                return null;
            }
        } catch (error) {
            console.error("Error updating school year:", error);
            toast.error("Failed to update school year.");
            return null;
        } finally {
            set({ isGettingSchoolYears: false });
        }
    }
}));