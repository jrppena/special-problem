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
        
        res.status(200).json(dummyGradesData);
    } catch (err) {
        console.error("Error:", err);
    }
}

const generateChartData = async (req, res) => {
    const { studentId, schoolYear, dataType, selectedSubject, selectedQuarter } = req.query;

    try {
        // Get all grades for the student in the selected school year
        const section = await Section.findOne({ 
            students: { $in: [studentId] }, 
            schoolYear: schoolYear 
        });
        
        if (!section) {
            return res.status(204).json({ message: "No section found for the student", data: [] });
        }
        
        // Find classes for this student's section
        const classes = await Class.find({ 
            sections: { $in: [section._id] }, 
            schoolYear: schoolYear 
        });
        
        if (!classes || classes.length === 0) {
            return res.status(204).json({ message: "No classes found for the student", data: [] });
        }
        
        // Fetch all grades for this student across these classes
        const classIds = classes.map(c => c._id);
        const allGrades = await Grade.find({
            class: { $in: classIds },
            student: studentId
        });

        // Process into the format expected by the frontend
        const gradesMap = new Map();
        
        // Initialize the gradesMap with class information
        classes.forEach(classItem => {
            gradesMap.set(classItem._id.toString(), {
                classId: classItem._id,
                className: classItem.subjectName,
                grades: { Q1: "-", Q2: "-", Q3: "-", Q4: "-" },
                average: "-"
            });
        });
        
        // Populate grades
        allGrades.forEach(grade => {
            const classId = grade.class.toString();
            if (gradesMap.has(classId)) {
                const classData = gradesMap.get(classId);
                
                if (typeof grade.gradeValue === 'number' && !isNaN(grade.gradeValue)) {
                    classData.grades[grade.gradingPeriod] = grade.gradeValue.toString();
                }
            }
        });
        
        // Calculate averages for each class
        gradesMap.forEach(classData => {
            let totalGrade = 0;
            let validGradeCount = 0;
            
            Object.values(classData.grades).forEach(grade => {
                const gradeValue = parseFloat(grade);
                if (!isNaN(gradeValue)) {
                    totalGrade += gradeValue;
                    validGradeCount++;
                }
            });
            
            if (validGradeCount > 0) {
                classData.average = (totalGrade / validGradeCount).toFixed(2);
            }
        });
        
        const gradesArray = Array.from(gradesMap.values());
        
        // Generate the final chart data based on data type
        let chartData = [];
        
        switch (dataType) {
            case "singleSubjectAcrossQuarters":
                if (!selectedSubject) {
                    return res.status(400).json({ message: "Subject selection required for this chart type" });
                }
                
                const subjectData = gradesArray.find(grade => grade.classId.toString() === selectedSubject);
                
                if (!subjectData) {
                    return res.status(204).json({ message: "No data for selected subject", data: [] });
                }
                
                chartData = [
                    { name: "Q1", [subjectData.className]: parseFloat(subjectData.grades.Q1) || 0 },
                    { name: "Q2", [subjectData.className]: parseFloat(subjectData.grades.Q2) || 0 },
                    { name: "Q3", [subjectData.className]: parseFloat(subjectData.grades.Q3) || 0 },
                    { name: "Q4", [subjectData.className]: parseFloat(subjectData.grades.Q4) || 0 }
                ];
                break;
                
            case "subjectsAcrossQuarters":
                chartData = gradesArray.map(subject => ({
                    name: subject.className,
                    Q1: parseFloat(subject.grades.Q1) || 0,
                    Q2: parseFloat(subject.grades.Q2) || 0,
                    Q3: parseFloat(subject.grades.Q3) || 0,
                    Q4: parseFloat(subject.grades.Q4) || 0,
                    Average: parseFloat(subject.average) || 0
                }));
                break;
                
            case "subjectsInOneQuarter":
                if (!selectedQuarter) {
                    return res.status(400).json({ message: "Quarter selection required for this chart type" });
                }
                
                chartData = gradesArray.map(subject => ({
                    name: subject.className,
                    Grade: parseFloat(subject.grades[selectedQuarter]) || 0
                }));
                break;
                
            default:
                return res.status(400).json({ message: "Invalid data type selected" });
        }
        
        return res.status(200).json({ data: chartData });
    } catch (error) {
        console.error("Error generating chart data:", error);
        return res.status(500).json({ message: "An error occurred while generating chart data" });
    }
};

export const studentRoutes = {
    getEnrolledClasses,
    getEnrolledClassesGrades,
    generateChartData

}