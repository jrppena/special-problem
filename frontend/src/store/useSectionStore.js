import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { use } from "react";

export const useSectionStore = create((set) => ({
  sections: [],
  availableAdvisers: [],
  loading: false,

  fetchSections: async (schoolYear) => {
    set({ loading: true });
    try {
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
      const response = await axiosInstance.get(
        `/section/get/available-advisers/${schoolYear}`
      );
      set({ availableAdvisers: response.data });
    } catch (error) {
      console.error("Error fetching available advisers:", error);
    }
  },

  createSection: async (section) => {
    try {
      const response =  await axiosInstance.post("/section/add", section);
      toast.success("Section created successfully");
      await useSectionStore.getState().fetchSections(section.schoolYear);
      await useSectionStore.getState().fetchAvailableAdvisers(section.schoolYear);
      
    } catch (error) {
      toast.error("Error creating section");
      console.error("Error creating section:", error);
    }
  },

  editSection: async (section) => {
    try {
      const response = await axiosInstance.put(`/section/edit/${section.id}`, section);
      toast.success("Section updated successfully");
      await useSectionStore.getState().fetchSections(section.schoolYear);
      await useSectionStore.getState().fetchAvailableAdvisers(section.schoolYear);
    } catch (error) {
      toast.error("Error updating section");
      console.error("Error updating section:", error);
    }
  },

  deleteSection: async (sectionId) => {
    try {
      const response = await axiosInstance.delete(`/section/delete/${sectionId}`);
      await useSectionStore.getState().fetchSections(response.data.schoolYear);
      await useSectionStore.getState().fetchAvailableAdvisers(response.data.schoolYear);
      toast.success("Section deleted successfully");
    } catch (error) {
      toast.error("Error deleting section");
      console.error("Error deleting section:", error);
    }
  },
}));
