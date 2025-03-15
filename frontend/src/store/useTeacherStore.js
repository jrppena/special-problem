import {create} from 'zustand';
import {axiosInstance} from '../lib/axios';
import toast from 'react-hot-toast';
import {useSectionStore} from './useSectionStore';
import { schoolYears } from '../constants';


export const useTeacherStore = create((set) => ({
    teachers: [],
    isFetchingTeachers: false,
    isAdviser: false,
    availableStudents: [],
    isFetchingAvailableStudents: false,
    assignedClasses: [],
    classGrades: {},

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
    },

    checkIfAdviser: async (userId) => {
        try{
            const response = await axiosInstance.get(`/teacher/check/if-adviser/${userId}`);
            set({isAdviser: true});
        }catch(error){
            console.log('Error in isAdviser: ', error);
            toast.error('Failed to check if user is an adviser');
        }
    },
    
    getAvailableStudents: async (gradeLevel, schoolYear) => {
        set({ isFetchingAvailableStudents: true });
        try {
        const response = await axiosInstance.get('/teacher/get/available-students', {
            params: { gradeLevel, schoolYear },
        });
        set({ availableStudents: response.data });
        } catch (error) {
        console.error('Error in getAvailableStudents: ', error);
        toast.error('Failed to fetch available students');
        } finally {
        set({ isFetchingAvailableStudents: false });
        }
    },
    
    addStudentToSection: async (data) => {
        try {
        const response = await axiosInstance.post('/teacher/add/student-to-section', {data});
        toast.success('Student added to section');
        return(response.data.updatedSection);
        
        } catch (error) {
        console.error('Error in addStudentToSection: ', error);
        toast.error('Failed to add student to section');
        }
    },

    removeStudentFromSection: async (data) => {
        try {
        const response = await axiosInstance.delete('/teacher/remove/student-from-section', {data});
        toast.success('Student removed from section');
        return(response.data.updatedSection);
        
        } catch (error) {
        console.error('Error in removeStudentFromSection: ', error);
        toast.error('Failed to remove student from section');
        }
    },

    getAssignedClasses: async (userId,schoolYear) => {
        try {
        const response = await axiosInstance.get('teacher/get/assigned-classes/',
            {params:{userId,schoolYear}}
        );
        set({assignedClasses: response.data});
        } catch (error) {
        console.error('Error in getAssignedClasses: ', error);
        toast.error('Failed to fetch assigned classes');
        }
    },

    getClassGrades: async(classId,gradingPeriod,section)=>{
        try{
            const response = await axiosInstance.get('/teacher/get/class-grades',{
                params:{classId,gradingPeriod,section}
            });
            set({classGrades: response.data});
        }catch(error){
            console.log('Error in getClassGrades: ', error);
            toast.error('Failed to fetch class grades');
        }
    },

    updateStudentGrades: async (selectedClass,editedGrades,section) => {
     
        try {
            const response = await axiosInstance.post('/teacher/update/student-grades', {selectedClass,editedGrades,section });
            toast.success('Student grades updated');
            set({classGrades: response.data.updatedClassGrades});
        } catch (error) {
            console.error('Error in updateStudentGrades: ', error);
            toast.error('Failed to update student grades');
        }
    },


    
}));