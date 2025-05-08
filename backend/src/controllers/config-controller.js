import Config from "../models/config.model.js";
import Class from "../models/class.model.js";
import Student from "../models/student.model.js";
import Grade from "../models/grade.model.js";
import Section from "../models/section.model.js";

const getAllSchoolYears = async (req, res) => {
    try {
      const config = await Config.findOne().select("schoolYears");
  
      if (!config?.schoolYears?.length) {
        return res.status(404).json({ message: "No school years found" });
      }
  
      const sortedSchoolYears = sortSchoolYearsDesc(config.schoolYears);
  
      return res.status(200).json({ schoolYears: sortedSchoolYears });
    } catch (error) {
      console.error("Error fetching school years:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
  // Helper function to sort school years in descending order
  const sortSchoolYearsDesc = (years) => {
    return [...years].sort((a, b) => {
      const [aStart] = a.split("-").map(Number);
      const [bStart] = b.split("-").map(Number);
      return bStart - aStart;
    });
  };
  

const getCurrentSchoolYear = async (req, res) => {
    const currentSchoolYear = await Config.findOne().select("currentSchoolYear");

    if (!currentSchoolYear) {
        return res.status(404).json({ message: "No current school year found" });
    }
    res.status(200).json(currentSchoolYear);
}

const updateCurrentSchoolYear = async (req, res) => {
  try {
    // Get the current school year
    const config = await Config.findOne().select("currentSchoolYear");

    if (!config || !config.currentSchoolYear) {
      return res.status(404).json({ message: "No current school year found" });
    }
    
    const currentSchoolYear = config.currentSchoolYear;

    // Extract the years from the current school year
    const [startYear, endYear] = currentSchoolYear.split('-').map(Number);
    
    // Calculate the new school year
    const newStartYear = startYear + 1;
    const newEndYear = endYear + 1;
    const newSchoolYear = `${newStartYear}-${newEndYear}`;
    const sections = await Section.find({ schoolYear: currentSchoolYear })
    
    for (const section of sections) {
      if (section.students.length === 0) {
        return res.status(400).json({ message: "Some sections still do not have students yet, it is not possible to update the school year" });
      }
    }
    // Fetch all classes with their sections in a single query
    const allClasses = await Class.find({ schoolYear: currentSchoolYear })
      .populate({
        path: 'sections',
        populate: {
          path: 'students',
          select: '_id'
        }
      });
    if(!allClasses || allClasses.length === 0) {
      return res.json({ message: "No classes found for the current school year. It's not possible to update school year when there are yet no classes" });
    }

    

    // Prepare data structure for missing grades check
    const classStudentMap = new Map();
    const sectionStudentMap = new Map();
    const sectionStudentCountMap = new Map(); // Track total students per section
    const allStudentIds = [];
    const sectionMap = new Map(); // For section name lookup
    
    // Process sections and students once instead of multiple times
    allClasses.forEach(classObj => {
      const classStudents = [];

      
      classObj.sections.forEach(section => {
        if (section && section.students) {
          const studentIds = section.students.map(student => student._id);
          sectionStudentMap.set(section._id.toString(), studentIds);
          classStudents.push(...studentIds);
          allStudentIds.push(...studentIds);
          
          // Store section info for later use
          sectionMap.set(section._id.toString(), {
            name: section.name || `Section ${section._id}`,
            grade: section.grade
          });
          
          // Store the total student count for each section
          sectionStudentCountMap.set(section._id.toString(), studentIds.length);
        }else if (section.students.length === 0) {
          return res.json({ message: "Some classes still do not have students yet, it is not possible to update the school year when some classes don't have students yet" });
        }
      });
      
      classStudentMap.set(classObj._id.toString(), {
        students: classStudents,
        className: classObj.subjectName
      });
    });
    
    // Fetch all relevant grades in a single query
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const allGrades = await Grade.find({
      class: { $in: allClasses.map(c => c._id) },
      gradingPeriod: { $in: quarters },
      student: { $in: allStudentIds }
    });
    
    // Create lookup map for quick grade checks
    const gradeMap = new Map();
    allGrades.forEach(grade => {
      const key = `${grade.class.toString()}-${grade.gradingPeriod}-${grade.student.toString()}`;
      gradeMap.set(key, true);
    });
    
    // Check for missing grades and organize by section
    const missingGradesBySection = new Map();
    
    allClasses.forEach(classObj => {
      const classId = classObj._id.toString();
      
      classObj.sections.forEach(section => {
        const sectionId = section._id.toString();
        const sectionInfo = sectionMap.get(sectionId);
        const students = sectionStudentMap.get(sectionId) || [];
        
        quarters.forEach(quarter => {
          const missingStudents = students.filter(studentId => {
            const key = `${classId}-${quarter}-${studentId.toString()}`;
            return !gradeMap.has(key);
          });
          
          if (missingStudents.length > 0) {
            if (!missingGradesBySection.has(sectionId)) {
              missingGradesBySection.set(sectionId, {
                sectionId: sectionId,
                sectionName: sectionInfo.name,
                sectionGrade: sectionInfo.grade,
                totalStudents: sectionStudentCountMap.get(sectionId) || 0, // Add total students count
                classes: []
              });
            }
            
            // Add this class to the section's list of classes with missing grades
            const sectionData = missingGradesBySection.get(sectionId);
            
            // Check if we already have an entry for this class
            let classEntry = sectionData.classes.find(c => c.classId.toString() === classId);
            
            if (!classEntry) {
              classEntry = {
                classId: classObj._id,
                className: classObj.subjectName,
                missingByQuarter: {}
              };
              sectionData.classes.push(classEntry);
            }
            
            // Add missing students count for this quarter
            classEntry.missingByQuarter[quarter] = missingStudents.length;
          }
        });
      });
    });
    
    // Convert the Map to an array for the response
    const missingGradesResponse = Array.from(missingGradesBySection.values());
    
    // If there are missing grades, return them in the response
    if (missingGradesResponse.length > 0) {
      return res.status(200).json({
        success: false,
        message: "Cannot update school year due to missing grades",
        sections: missingGradesResponse,
        currentSchoolYear: currentSchoolYear
      });
    }
    
    // Calculate student grade averages
    // Group grades by student to calculate their averages
    const studentGrades = new Map();
    
    // Process all grades to compute averages per student
    allGrades.forEach(grade => {
      const studentId = grade.student.toString();
      
      if (!studentGrades.has(studentId)) {
        studentGrades.set(studentId, {
          totalScore: 0,
          gradeCount: 0
        });
      }
      
      const studentData = studentGrades.get(studentId);
      studentData.totalScore += grade.score;
      studentData.gradeCount += 1;
    });
    
    // Calculate averages
    const studentAverages = new Map();
    studentGrades.forEach((data, studentId) => {
      const average = data.gradeCount > 0 ? data.totalScore / data.gradeCount : 0;
      studentAverages.set(studentId, average);
    });
    
    // Get all students below grade 10 for potential promotion
    const studentsToEvaluate = await Student.find({ gradeLevel: { $lt: 10 }});
    
    // Filter students based on their grade average
    const promotedStudents = [];
    const failedStudents = [];
    const failedStudentIds = [];
    
    studentsToEvaluate.forEach(student => {
      const studentId = student._id.toString();
      const average = studentAverages.get(studentId) || 0;
      
      if (average > 85) {
        promotedStudents.push(student._id);
      } else {
        failedStudentIds.push(student._id);
        failedStudents.push({
          studentId: student._id,
          average: average,
          currentGrade: student.gradeLevel,
          status: "Retained"
        });
      }
    });
    
    // Update academic status to "Retained" for all students who failed
    if (failedStudentIds.length > 0) {
      await Student.updateMany(
        { _id: { $in: failedStudentIds } },
        { $set: { academicStatus: "Retained" } }
      );
    }
    
    // Use bulkWrite for more efficient database operations - only promote students with avg > 85
    const bulkOps = promotedStudents.map(studentId => ({
      updateOne: {
        filter: { _id: studentId },
        update: { $inc: { gradeLevel: 1 } }
      }
    }));
    
    const bulkResult = await Student.bulkWrite(bulkOps);
    
    // Handle completion for 10th grade students - only graduate those with avg > 85
    const grade10Students = await Student.find({ gradeLevel: 10 });
    
    // Process each grade 10 student
    const completedCount = await Promise.all(grade10Students.map(async (student) => {
      const studentId = student._id.toString();
      const average = studentAverages.get(studentId) || 0;
      
      if (average > 85) {
        // Student meets completion requirements
        student.academicStatus = "Completed";
        await student.save();
        return true;
      } else {
        // Student doesn't meet grade requirements for completion
        student.academicStatus = "Retained";
        await student.save();
        
        // Add to failed students list for reporting
        failedStudents.push({
          studentId: student._id,
          average: average,
          currentGrade: student.gradeLevel,
          status: "Senior Not Graduated"
        });
        return false;
      }
    })).then(results => results.filter(Boolean).length);

    // Update application config with new school year
    const configUpdate = await Config.findOneAndUpdate(
      {}, 
      {
        $set: { currentSchoolYear: newSchoolYear },
        $addToSet: { schoolYears: newSchoolYear } // use $push if duplicates are allowed
      },
      { upsert: true, new: true }
    );
    
    // Calculate statistics for the response
    return res.status(200).json({
      success: true,
      message: "School year updated successfully and eligible students promoted/graduated",
      previousSchoolYear: currentSchoolYear,
      currentSchoolYear: newSchoolYear,
      promotionSummary: {
        totalStudents: studentsToEvaluate.length + grade12Students.length,
        promotedStudents: bulkResult.modifiedCount,
        completedStudents: completedCount,
        failedPromotions: failedStudents.length,
        studentsRetained: failedStudents
      }
    });
    
  } catch (error) {
    console.error("Error updating school year:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update school year",
      error: error.message
    });
  }
};

export const configRoutes={
    getAllSchoolYears,
    getCurrentSchoolYear,
    updateCurrentSchoolYear
}
