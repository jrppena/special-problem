import {create} from 'zustand';
import {axiosInstance} from '../lib/axios';
import toast from 'react-hot-toast';

export const useStudentStore = create((set) => ({
    classes: [],
    grades: [],
    chartData: [],
    isChartDataLoading: false,
    isGettingGrades: false,
    chartAnalysis: [],

    getEnrolledClasses: async (studentId,schoolYear) => {
        try {
            const response = await axiosInstance.get('/student/enrolled-classes/',
                {
                    params: {
                        studentId: studentId,
                        schoolYear: schoolYear,
               
                    }
                }
            );
            set({classes: response.data.classes});
            return(response.data.classes);
        } catch (error) {
            toast.error("Failed to get enrolled classes");
        }
    },

    getEnrolledClassesGrades: async (classes,student,schoolYear) => {
        set({isGettingGrades: true});
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
        }finally{
            set({isGettingGrades: false});
        }
    },
    
    getChartData: async (studentId, schoolYear, dataType, selectedSubject, selectedQuarter) => {
        try {
            set({ isChartDataLoading: true });
            const response = await axiosInstance.get('/student/chart-data/',
                {
                    params: {
                        studentId,
                        schoolYear,
                        dataType,
                        selectedSubject,
                        selectedQuarter
                    }
                }
            );
            
            if (response.status === 200) {
                set({ chartData: response.data.data, isChartDataLoading: false });
                return response.data.data;
            } else {
                set({ chartData: [], isChartDataLoading: false });
                return [];
            }
        } catch (error) {
            toast.error("Failed to get chart data");
            set({ chartData: [], isChartDataLoading: false });
            return [];
        }
    },

    clearGrades: () => set({ grades: [], isGettingGrades: false }),
    clearClasses: () => set({ classes: [] }),




}));