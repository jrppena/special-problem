import Student from "../models/student.model.js"; // adjust the path as needed
import Section from "../models/section.model.js";
import Class from "../models/class.model.js";
import Grade from "../models/grade.model.js";
import mongoose from "mongoose";



const getEnrolledClasses = async (req, res) => {
    const studentId = req.user._id;
    const schoolYear = req.query.schoolYear;
    
    try {
        const section = await Section.findOne({
            students: { $in: [studentId] },
            schoolYear
        });

        if (!section) {
            return res.status(200).json({ message: "No section found for the student for the given school year", classes: [] });
        }

        const classes = await Class.find({
            sections: { $in: [section._id] },
            schoolYear
        });

        if (!classes || classes.length === 0) {
            return res.status(200).json({ message: "No classes found for the student for the given school year", classes: [] });
        }

        return res.status(200).json(classes);

    } catch (error) {
        console.error("Error in getEnrolledClasses:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};


const getEnrolledClassesGrades = async (req, res) => {
    const classes = req.query.classes;
    const student = req.user._id;
    const schoolYear = req.query.schoolYear;

    try {
        const dummyGradesData = [];

        for (const classItem of classes) {
            const specificClass = await Class.findOne({ _id: classItem._id, schoolYear: schoolYear }).populate("sections").exec();

            if (!specificClass) {
                return res.status(200).json({ message: "Class does not exist", data: [] });
            }

            if(!specificClass.sections || specificClass.sections.length === 0) {
                return res.status(200).json({ message: "No sections found for the class", data: [] });
            }

            if(!specificClass.sections.some(section => section.students.includes(student))) {
                return res.status(403).json({ message: "Forbidden: Student not enrolled in this class", data: [] });
            }
            
            
            const grades = await Grade.find({
                class: classItem._id,
                student: student,
            });

            const gradeMapData = {
                classId: classItem._id,
                className: classItem.subjectName,
                grades: { Q1: "-", Q2: "-", Q3: "-", Q4: "-" },
                average: "-"
            };

            let totalGrades = 0;
            let validGradesCount = 0;

            grades.forEach(grade => {
                if (gradeMapData.grades.hasOwnProperty(grade.gradingPeriod)) {
                    const gradeValue = grade.gradeValue;
                    if (typeof gradeValue === 'number' && !isNaN(gradeValue)) {
                        gradeMapData.grades[grade.gradingPeriod] = gradeValue.toString();
                        totalGrades += gradeValue;
                        validGradesCount++;
                    }
                }
            });

            if (validGradesCount > 0) {
                gradeMapData.average = (totalGrades / validGradesCount).toFixed(2);
            }

            dummyGradesData.push(gradeMapData);
        }

        return res.status(200).json(dummyGradesData);

    } catch (err) {
        console.error("Error in getEnrolledClassesGrades:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
};


const generateChartData = async (req, res) => {
    const {schoolYear, dataType, selectedSubject, selectedQuarter } = req.query;

    const studentId = req.user._id; 

    if(!studentId || !schoolYear || !dataType) {
        return res.status(400).json({ message: "Missing required parameters" });
    }

    try {
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