import Student from "../models/student.model.js"; // adjust the path as needed
import Section from "../models/section.model.js";
import Class from "../models/class.model.js";
import Grade from "../models/grade.model.js";



const getEnrolledClasses = async (req,res) => {
    const studentId = req.query.studentId;
    const schoolYear = req.query.schoolYear;

    try {
        const section = await Section.findOne({ students: { $in: [studentId] }, schoolYear: schoolYear })
        
        if(!section){
            return res.status(204).json({message: "No section found for the student for the given school year", classes: []});
        }

       
        const classes = await Class.find({ sections:{$in: [section._id]}, schoolYear:schoolYear});
        if(!classes){
            return res.status(204).json({message: "No classes found for the student for the given school year", classes: []});
        }


        console.log(classes);

        return res.status(200).json(classes);
     

    }catch(error){
        console.log("Error in getEnrolledClasses: ", error);
        return res.status(500).json({message: "Something went wrong"});
    }
}

const getEnrolledClassesGrades = async(req,res) => {
    const classes = req.query.classes;
    const student = req.query.student;
    const schoolYear = req.query.schoolYear;

    try {
        const dummyGradesData = [];
        let counter = 0;
        // Iterate over each class
        for (const classItem of classes) {
            // Fetch grades for the given class, student, and school 
            
            const grades = await Grade.find({
                class: classItem._id, 
                student: student, 
            });
    
            // Initialize the object for this class
            const gradeMapData = {
                classId: classItem._id,
                className: classItem.subjectName, // Using subjectName as the class name
                grades: { Q1: "-", Q2: "-", Q3: "-", Q4: "-" }, // Set default grades as "-"
                average: "-" // Default average
            };
            
            // Populate grades for each grading period (Q1, Q2, Q3, Q4)
            let totalGrades = 0;
            let validGradesCount = 0;
            
            grades.forEach(grade => {
                if (gradeMapData.grades.hasOwnProperty(grade.gradingPeriod)) {
                const gradeValue = grade.gradeValue;
            
                // Check if the gradeValue is a valid number
                if (typeof gradeValue === 'number' && !isNaN(gradeValue)) {
                    gradeMapData.grades[grade.gradingPeriod] = gradeValue.toString(); // Convert grade to string
                    totalGrades += gradeValue; // Add to total grades
                    validGradesCount++; // Increment valid grades count
                }
                }
            });
            
            // Calculate the average if there are valid grades
            if (validGradesCount > 0) {
                gradeMapData.average = (totalGrades / validGradesCount).toFixed(2); // Round to 2 decimal places
            } else {
                gradeMapData.average = "-"; // No valid grades available
            }
  
  
    
            // Push the gradeMapData object to dummyGradesData
            dummyGradesData.push(gradeMapData);
        }
        
        console.log(dummyGradesData);
        res.status(200).json(dummyGradesData);
    } catch (err) {
        console.error("Error:", err);
    }
}
export const studentRoutes = {
    getEnrolledClasses,
    getEnrolledClassesGrades

}