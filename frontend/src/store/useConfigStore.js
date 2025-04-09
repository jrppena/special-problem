import {create} from 'zustand';
import toast from "react-hot-toast";
import {axiosInstance} from "../lib/axios";
import { schoolYears } from '../constants';

export const useConfigStore = create((get,set) => ({
    schoolYears:[],
    isGettingSchoolYears: false,

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
        }finally{
            set({ isGettingSchoolYears: false });
        }
    },
}));