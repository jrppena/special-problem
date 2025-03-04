import {create} from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSectionStore = create((set) => ({
    sections: [],
    avaialbleAdvisers: [],
    loading: false,
    
    fetchSections: async (schoolYear) => {
        set({ loading: true });
        try {
        console.log("Fetching sections...");
        const response = await axiosInstance.get(`/section/get/${schoolYear}`);
        set({ sections: response.data });
        } catch (error) {
        console.error("Error fetching sections:", error);
        } finally {
        set({ loading: false });
        }
    },

    fetchAvailableAdvisers: async (schoolYear) => {
        try {
        const response = await axiosInstance.get(`/section/get/available-advisers/${schoolYear}`);
        set({ availableAdvisers: response.data });
        } catch (error) {
        console.error("Error fetching available advisers:", error);
        }
    },
    
    createSection: async (section) => {
        try {
        await axiosInstance.post("/sections", section);
        toast.success("Section created successfully");
        } catch (error) {
        toast.error("Error creating section");
        console.error("Error creating section:", error);
        }
    },
    
    editSection: async (section) => {
        try {
        await axiosInstance.put(`/sections/${section.id}`, section);
        toast.success("Section updated successfully");
        } catch (error) {
        toast.error("Error updating section");
        console.error("Error updating section:", error);
        }
    },
    
    deleteSection: async (sectionId) => {
        try {
        await axiosInstance.delete(`/sections/${sectionId}`);
        set((state) => ({
            sections: state.sections.filter((section) => section.id !== sectionId),
        }));
        toast.success("Section deleted successfully");
        } catch (error) {
        toast.error("Error deleting section");
        console.error("Error deleting section:", error);
        }
    },

}));