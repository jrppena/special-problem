import Teacher from '../models/teacher.model.js';
import Section from '../models/section.model.js';
import Student from '../models/student.model.js';
import Class from '../models/class.model.js';
import Grade from '../models/grade.model.js';

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

        const grade = await Grade.find({ student: studentId, schoolYear: updatedSection.schoolYear });
        if(grade) {
            res.status(200).json({ success: false, message: 'Cannot remove student from section. Student has grades' });
        }
    
        res.json({ success: true, updatedSection });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to remove student from section' });
      }
  }

  const getAssignedClasses = async (req, res) => {
    const userId = req.query.userId;
    const schoolYear = req.query.schoolYear;

    try {
        const classes = await Class.find({ teachers: { $in: [userId] }, schoolYear: schoolYear })
          .populate({
            path: 'sections', // First populate sections
            populate: {
              path: 'students', // Then populate students inside sections
              model: 'Student' // Ensure correct model reference
            }
        });
        res.status(200).json(classes);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
  }

  const getClassGrades = async (req, res) => {
    const classId = req.query.classId;
    const gradingPeriod = req.query.gradingPeriod;
    const section = req.query.section;

    try {
        // Initialize gradeMap with default values for all students in the section
        const gradeMap = {};
        section.students.forEach((student) => {
            gradeMap[student._id] = {
                Q1: "-",
                Q2: "-",
                Q3: "-",
                Q4: "-",
            };
        });

        // Determine whether to fetch a single quarter or all quarters
        const queryCriteria = {
            class: classId,
            gradingPeriod: gradingPeriod === "all" ? { $in: ["Q1", "Q2", "Q3", "Q4"] } : gradingPeriod
        };

        // Fetch existing grades for the class and the specified grading period(s)
        const grades = await Grade.find(queryCriteria).populate('student', '_id');

        // Update gradeMap with actual values if grades exist
        grades.forEach((grade) => {
            gradeMap[grade.student._id] = {
                ...gradeMap[grade.student._id],
                [grade.gradingPeriod]: grade.gradeValue, // ✅ Dynamically update based on gradingPeriod
            };
        });

        res.status(200).json(gradeMap);

    } catch (error) {
        console.error("Error in getClassGrades:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


  // 🟢 Fetch and format existing grades into a lookup table
  const getExistingGradesMap = async (selectedClass) => {
      const existingGrades = await Grade.find({ class: selectedClass });

      const gradesMap = {};
      existingGrades.forEach((grade) => {
          if (!gradesMap[grade.student]) {
              gradesMap[grade.student] = {};
          }
          gradesMap[grade.student][grade.gradingPeriod] = grade.gradeValue;
      });

      return gradesMap;
  };

  // 🟢 Validate grade value (0-100) and return numeric value or error
  const validateGradeValue = (value) => {
      const numericGrade = parseInt(value);
      if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
          return null; // Invalid grade
      }
      return numericGrade;
  };

  // 🟢 Check if a grade should be updated (ignores empty & unchanged grades)
  const shouldUpdateGrade = (existingGradesMap, studentId, gradingPeriod, newGrade) => {
    const currentGradeInDB = existingGradesMap[studentId]?.[gradingPeriod] ?? "-";

    // Convert to string for safe comparison
    const newGradeStr = String(newGrade);

    // Skip updating if:
    // - The new grade is empty ("-" or "")
    // - The new grade is the same as the current grade in the database
    return !(newGradeStr.trim() === "-" || newGradeStr.trim() === "" || newGrade === currentGradeInDB);
  };

  // 🟢 Update or insert grade in the database
  const updateOrCreateGrade = async (selectedClass, studentId, gradingPeriod, gradeValue) => {
      let existingGrade = await Grade.findOne({ class: selectedClass, student: studentId, gradingPeriod });

      if (existingGrade) {
          existingGrade.gradeValue = gradeValue;
          await existingGrade.save();
      } else {
          await Grade.create({ class: selectedClass, student: studentId, gradingPeriod, gradeValue });
      }
  };

    const updateStudentGrades = async (req, res) => {
      try {
          const { selectedClass, editedGrades, section } = req.body;

          if (!selectedClass || !editedGrades || typeof editedGrades !== "object") {
              return res.status(400).json({ error: "Invalid input data." });
          }

          const bulkOperations = [];
          const existingGradesMap = await getExistingGradesMap(selectedClass);
          // 🟢 Prepare bulk operations
          for (const studentId in editedGrades) {
              for (const gradingPeriod in editedGrades[studentId]) {
                  const gradeValue = validateGradeValue(editedGrades[studentId][gradingPeriod]);

                  if (gradeValue !== null) {
                      const currentGradeInDB = existingGradesMap[studentId]?.[gradingPeriod] ?? "-";
                      
                      // 🟢 Only update if the grade actually changed
                      if (gradeValue !== currentGradeInDB) {
                          bulkOperations.push({
                              updateOne: {
                                  filter: { class: selectedClass, student: studentId, gradingPeriod },
                                  update: { $set: { gradeValue } },
                                  upsert: true, // ✅ Creates new entry if not found
                              }
                          });
                      }
                  }
              }
          }

          // 🟢 Execute batch update if there are changes
          if (bulkOperations.length > 0) {
              await Grade.bulkWrite(bulkOperations);
          } else {
              return res.status(200).json({ message: "No changes detected. Grades remain the same." });
          }

          // 🟢 Fetch updated grades in a single query
          const updatedGrades = await Grade.find({
              class: selectedClass,
              gradingPeriod: { $in: ["Q1", "Q2", "Q3", "Q4"] },
              student: { $in: Object.keys(editedGrades) } // Only fetch grades for students that were edited
          }).populate("student", "_id");

          // 🟢 Format updated grades into a structured object
          const updatedClassGrades = {};
          updatedGrades.forEach((grade) => {
              if (!updatedClassGrades[grade.student._id]) {
                  updatedClassGrades[grade.student._id] = { Q1: "-", Q2: "-", Q3: "-", Q4: "-" };
              }
              updatedClassGrades[grade.student._id][grade.gradingPeriod] = grade.gradeValue;
          });
          console.log("updatedClassGrades", updatedClassGrades);

          return res.status(200).json({ 
              message: "Grades updated successfully.", 
              updatedClassGrades 
          });

      } catch (error) {
          console.error("Error updating student grades:", error);
          res.status(500).json({ error: "Internal Server Error" });
      }
  };

  // In your teacher.controller.js
const getChartData = async (req, res) => {
    const { classId, gradingPeriod, dataType, sectionId } = req.query;
    try {
      if (dataType === "singleSectionPerformance") {
        // Ensure a sectionId is provided
        if (!sectionId) {
          return res.status(400).json({ message: "sectionId is required for singleSectionPerformance" });
        }
        // Fetch the section and its students
        const section = await Section.findById(sectionId).populate("students");
        if (!section) {
          return res.status(404).json({ message: "Section not found" });
        }
  
        // Initialize gradeMap for each student (default grade is 0)
        const gradeMap = {};
        section.students.forEach((student) => {
          gradeMap[student._id] = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
        });
  
        // Build query criteria for fetching grades
        const queryCriteria = {
          class: classId,
          student: { $in: section.students.map((s) => s._id) }
        };
        if (gradingPeriod === "all") {
          queryCriteria.gradingPeriod = { $in: ["Q1", "Q2", "Q3", "Q4"] };
        } else {
          queryCriteria.gradingPeriod = gradingPeriod;
        }
  
        // Query grades and update the gradeMap
        const grades = await Grade.find(queryCriteria).populate("student", "_id");
        grades.forEach((grade) => {
          gradeMap[grade.student._id] = {
            ...gradeMap[grade.student._id],
            [grade.gradingPeriod]: parseFloat(grade.gradeValue) || 0
          };
        });
  
        let processedData = [];
        if (gradingPeriod === "all") {
          // Create data for all quarters; group by quarter with student names as keys
          const quarterData = { Q1: {}, Q2: {}, Q3: {}, Q4: {} };
          section.students.forEach((student) => {
            const studentName = `${student.lastName}, ${student.firstName}`;
            ["Q1", "Q2", "Q3", "Q4"].forEach((q) => {
              quarterData[q][studentName] = gradeMap[student._id][q];
            });
          });
          processedData = [
            { name: "Q1", ...quarterData.Q1 },
            { name: "Q2", ...quarterData.Q2 },
            { name: "Q3", ...quarterData.Q3 },
            { name: "Q4", ...quarterData.Q4 }
          ];
        } else {
          // For a specific quarter, map each student to an object with their grade
          processedData = section.students.map((student) => {
            const studentName = `${student.lastName}, ${student.firstName}`;
            return {
              name: studentName,
              Grade: gradeMap[student._id][gradingPeriod]
            };
          });
        }
        return res.status(200).json(processedData);
  
      } else if (dataType === "sectionsPerformance") {
        // Fetch the class with its sections and their students
        const classData = await Class.findById(classId).populate({
          path: "sections",
          populate: { path: "students" }
        });
        if (!classData) {
          return res.status(404).json({ message: "Class not found" });
        }
  
        // Gather all student IDs across all sections
        const allStudentIds = [];
        classData.sections.forEach((section) => {
          section.students.forEach((student) => {
            allStudentIds.push(student._id);
          });
        });
  
        // Build query criteria to get grades for these students
        const queryCriteria = {
          class: classId,
          student: { $in: allStudentIds }
        };
        if (gradingPeriod === "all") {
          queryCriteria.gradingPeriod = { $in: ["Q1", "Q2", "Q3", "Q4"] };
        } else {
          queryCriteria.gradingPeriod = gradingPeriod;
        }
  
        // Query grades
        const grades = await Grade.find(queryCriteria).populate("student", "_id");
  
        // Build a lookup for each student's grades
        const gradeLookup = {};
        grades.forEach((grade) => {
          if (!gradeLookup[grade.student._id]) {
            gradeLookup[grade.student._id] = {};
          }
          gradeLookup[grade.student._id][grade.gradingPeriod] = parseFloat(grade.gradeValue) || 0;
        });
  
       // Process each section to calculate average grades
        const processedData = classData.sections.map((section) => {
          const sectionName = `${section.gradeLevel}-${section.name}`;
          const sectionAverages = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
          const counts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 }; // Track count for each quarter separately
          
          section.students.forEach((student) => {
            const studentGrades = gradeLookup[student._id] || {};
            ["Q1", "Q2", "Q3", "Q4"].forEach((q) => {
              const score = studentGrades[q] || 0;
              if (score > 0) {
                sectionAverages[q] += score;
                counts[q]++; // Increment count for this specific quarter
              }
            });
          });
          
          // Calculate average per quarter (if there were any scores)
          ["Q1", "Q2", "Q3", "Q4"].forEach((q) => {
            sectionAverages[q] = counts[q] > 0 ? 
              parseFloat((sectionAverages[q] / counts[q]).toFixed(1)) : 0;
          });
  
          if (gradingPeriod === "all") {
            return {
              name: sectionName,
              ...sectionAverages
            };
          } else {
            return {
              name: sectionName,
              Grade: sectionAverages[gradingPeriod] || 0
            };
          }
        });
        return res.status(200).json(processedData);
      } else {
        return res.status(400).json({ message: "Invalid dataType" });
      }
    } catch (error) {
      console.error("Error in getChartData:", error);
      return res.status(500).json({ message: "Failed to generate chart data" });
    }
  };
  


  
    

    

export const teacherRoutes = {
    getTeachers,
    checkIfAdviser,
    getAvailableStudents,
    addStudentToSection,
    removeStudentFromSection,
    getAssignedClasses,
    updateStudentGrades,
    getClassGrades,
    getChartData
};

