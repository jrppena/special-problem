import {create} from 'zustand';
import {axiosInstance} from '../lib/axios';
import toast from 'react-hot-toast';

export const useStudentStore = create((set) => ({
    classes: [],
    grades: [],

    getEnrolledClasses: async (studentId,schoolYear) => {
        console.log("studentId: ", studentId);
        console.log("schoolYear: ", schoolYear);
        try {
            const response = await axiosInstance.get('/student/enrolled-classes/',
                {
                    params: {
                        studentId: studentId,
                        schoolYear: schoolYear,
               
                    }
                }
            );
            set({classes: response.data});
            console.log(response.data);
            return(response.data);
        } catch (error) {
            toast.error("Failed to get enrolled classes");
        }
    },

    getEnrolledClassesGrades: async (classes,student,schoolYear) => {
        try{
            const response = await axiosInstance.get('/student/enrolled-classes-grades/',
                {
                    params: {
                        classes: classes,
                        student: student,
                        schoolYear: schoolYear,
                    }
                }
            );
            set({grades: response.data});
        }catch(error){
            toast.error("Failed to get enrolled classes grades");
        }
    }


}));