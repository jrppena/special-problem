import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useClassStore = create((set) => ({
    classes: [],
    
    fetchClasses: async (schoolYear) => {
        try {
            const response = await axiosInstance.get(`/class/get/${schoolYear}`);
            set({ classes: response.data });
            console.log('Classes: ', response.data);
        } catch (error) {
            console.log('Error in fetchClasses: ', error);
        }
    },

    createClass: async (classData) => {
        try {
            const response = await axiosInstance.post('/class/create', classData);
            await useClassStore.getState().fetchClasses(classData.schoolYear);
            toast.success('Class created successfully');
        } catch (error) {
            console.log('Error in createClass: ', error);
            toast.error(error.response.data.message);
        }
    },

    editClass: async (classData) => {
        try {
            const response = await axiosInstance.put(`/class/edit/${classData.id}`, classData);
            await useClassStore.getState().fetchClasses(classData.schoolYear);
            toast.success('Class updated successfully');
        } catch (error) {
            console.log('Error in editClass: ', error);
            toast.error(error.response.data.message);
        }
    },
    deleteClass: async (classId,schoolYear) => {
        try {
            const response = await axiosInstance.delete(`/class/delete/${classId}`);
            await useClassStore.getState().fetchClasses(schoolYear);
            toast.success('Class deleted successfully');
        } catch (error) {
            console.log('Error in deleteClass: ', error);
            toast.error(error.response.data.message);
        }
    }

}));