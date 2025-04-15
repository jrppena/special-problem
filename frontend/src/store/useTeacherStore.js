import {create} from 'zustand';
import {axiosInstance} from '../lib/axios';
import toast from 'react-hot-toast';

export const useTeacherStore = create((set) => ({
    teachers: [],
    isFetchingTeachers: false,
    isAdviser: false,
    availableStudents: [],
    isFetchingAvailableStudents: false,
    assignedClasses: [],
    classGrades: {},
    selectedStudentGrades: {},
    adviserSectionGrades: {},
    
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
            const response = await axiosInstance.delete('e', {data});

            if(response.message){
                toast.error(response.message);
                return;
            }
            toast.success('Student removed from section');
            return(response.data.updatedSection);
        
        } catch (error) {
            console.error('Error in removeStudentFromSection: ', error);
            if(error.response?.data?.message){
                toast.error(error.response.data.message);
                return;
            }
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

    getClassGrades: async(classId,gradingPeriod,sectionId,schoolYear)=>{
        try{
            const response = await axiosInstance.get('/teacher/get/class-grades',{
                params:{classId,gradingPeriod,sectionId,schoolYear}
            });
            set({classGrades: response.data});
        }catch(error){
            console.log('Error in getClassGrades: ', error);
            toast.error(error.response?.data?.message || 'Failed to fetch class grades');
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

    getChartData: async (classId, schoolYear, gradingPeriod, section, dataType, selectedStudents = []) => {
        try {
          // Build the base query params
          const params = { classId, schoolYear, gradingPeriod, dataType };
          
          // If single section, pass section._id
          if (dataType === "singleSectionPerformance" && section) {
            params.sectionId = section._id;
            
            // Add selected students to query if provided and not empty
            if (selectedStudents && selectedStudents.length > 0) {
              params.studentIds = JSON.stringify(selectedStudents);
            }
          }
          
          const response = await axiosInstance.get('/teacher/get/chart-data', { params });
          return response.data;
        } catch (error) {
          console.error('Error in getChartData: ', error);
          toast.error('Failed to fetch chart data');
          return null;
        }
    },

      getSpecificStudentGrades: async (studentId, sectionId, schoolYear) => {
        try {
          const response = await axiosInstance.get('teacher/get/specific-student-grades', {
            params: { studentId, sectionId, schoolYear },
          });
          set({selectedStudentGrades:response.data})
      
          toast.success("Successfully fetched student grades");
          return(response.data)
        } catch (error) {
          console.error('Error:', error.response?.data || error.message);
          toast.error('Failed to get grades');
        }
      },

      getAdviserSectionGrades: async(sectionId, schoolYear)=>{
        try{
            const response = await axiosInstance.get('teacher/get/section-grades',{
                params:{sectionId, schoolYear}
            });
            console.log(response.data);
            set({adviserSectionGrades: response.data});
        }catch(error){
            console.log('Error in getAdviserSectionGrades: ', error);
        }
      }
      


    
}));