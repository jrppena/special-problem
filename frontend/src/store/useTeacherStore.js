import {create} from 'zustand';
import {axiosInstance} from '../lib/axios';
import toast from 'react-hot-toast';


export const useTeacherStore = create((set) => ({
    teachers: [],
    isFetchingTeachers: false,

    getTeachers: async () => {
        set({isFetchingTeachers: true});
        try{
            const response = await axiosInstance.get('/teacher/get');
            set({teachers: response.data});
        }catch(error){
            console.log('Error in getTeachers: ', error);
            toast.error('Failed to fetch teachers');
        }finally{
            set({isFetchingTeachers: false});
        }
    }
    
}));