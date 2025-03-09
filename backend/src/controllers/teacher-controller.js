import Teacher from '../models/teacher.model.js';
import Section from '../models/section.model.js';
import Student from '../models/student.model.js';

const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).json(teachers);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const checkIfAdviser = async (req, res) => {
    const userId = req.params.id;

    try {        
        const adviser = await Section.findOne({ adviser: userId });
        if(adviser) {
            res.status(200).json(adviser);
        } else {
            res.status(404).json({ message: 'User is not an adviser' });
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const getAvailableStudents = async (req, res) => {
    try {
      // Extract gradeLevel and schoolYear from query parameters
      const gradeLevel = parseInt(req.query.gradeLevel, 10);
      const schoolYear = req.query.schoolYear;
      
      if (!gradeLevel || !schoolYear) {
        return res.status(400).json({ message: "gradeLevel and schoolYear query parameters are required" });
      }
      
      // Get all sections for the given school year and collect their student IDs
      const sections = await Section.find({ schoolYear }, "students");
      let usedStudentIds = [];
      sections.forEach((section) => {
        usedStudentIds = usedStudentIds.concat(section.students);
      });
      
      // Find students of the given grade level that are not in any section for that school year
      const availableStudents = await Student.find({
        gradeLevel,
        _id: { $nin: usedStudentIds },
      });
      
      return res.status(200).json(availableStudents);
    } catch (error) {
      console.log("Error in getAvailableStudents: ", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  };
  
const addStudentToSection =  async (req, res) => {
    const { sectionId, studentIds, schoolYear } = req.body.data;
  
    try {
        // Add students to the section in the database
        const updatedSection = await Section.findByIdAndUpdate(
          sectionId,
          { $push: { students: { $each: studentIds } } },
          { new: true } // Return the updated document
        ).populate('students'); // Populate the students if needed
    
        res.json({ success: true, updatedSection });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add student to section' });
      }
  };

  const removeStudentFromSection =  async (req, res) => {
    const { sectionId, studentId } = req.body;
  
    try {
        // Add students to the section in the database
        const updatedSection = await Section.findByIdAndUpdate(
          sectionId,
          { $pull: { students: studentId } },
          { new: true } // Return the updated document
        ).populate('students'); // Populate the students if needed
    
        res.json({ success: true, updatedSection });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to remove student from section' });
      }
  }


export const teacherRoutes = {
    getTeachers,
    checkIfAdviser,
    getAvailableStudents,
    addStudentToSection,
    removeStudentFromSection
};

