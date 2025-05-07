import Student from "../models/student.model.js"; 
import Section from "../models/section.model.js";
import Class from "../models/class.model.js";
import Grade from "../models/grade.model.js";
import Config from "../models/config.model.js"; 
import mongoose from "mongoose";
import { request } from "express";



const getEnrolledClasses = async (req, res) => {
    const studentId = req.user._id;
    const requestedSchoolYear = req.query.schoolYear;
    
    try {
       // First, validate the requested school year
       const config = await Config.findOne();
       if (!config) {
           return res.status(500).json({ message: "System configuration not found" });
       }
       
       // Check if the requested school year is valid
       if (!config.schoolYears.includes(requestedSchoolYear)) {
           return res.status(400).json({ message: "Invalid school year requested" });
       }
       
       // Proceed with existing logic
       const section = await Section.findOne({
           students: { $in: [studentId] },
           schoolYear: requestedSchoolYear
       });

        if (!section) {
            return res.status(200).json({ message: "No section found for the student for the given school year", classes: [] });
        }

        const classes = await Class.find({
            sections: { $in: [section._id] },
            schoolYear: requestedSchoolYear
        });

        if (!classes || classes.length === 0) {
            return res.status(200).json({ message: "No classes found for the student for the given school year", classes: [] });
        }

        return res.status(200).json({classes: classes});

    } catch (error) {
        console.error("Error in getEnrolledClasses:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const getEnrolledClassesGrades = async (req, res) => {
    let requestedClasses = req.query.classes;
    const studentId = req.user._id;
    const schoolYear = req.query.schoolYear;
    if (typeof requestedClasses === 'string') {
        requestedClasses = JSON.parse(requestedClasses);
      }

    try {
        // Validate school year
        const config = await Config.findOne();
        if (!config || !config.schoolYears.includes(schoolYear)) {
            return res.status(400).json({ message: "Invalid school year requested" });
        }

        // First, get all classes the student is legitimately enrolled in
        const studentSections = await Section.find({
            students: { $in: [studentId] },
            schoolYear
        });
        
        if (!studentSections || studentSections.length === 0) {
            return res.status(200).json({ message: "Student not enrolled in any sections for this school year", data: [] });
        }
        
        const sectionIds = studentSections.map(section => section._id);
        
        const enrolledClasses = await Class.find({
            sections: { $in: sectionIds },
            schoolYear
        });
        
        if (!enrolledClasses || enrolledClasses.length === 0) {
            return res.status(200).json({ message: "No classes found for this student", data: [] });
        }
        
        // Get valid class IDs that the student is actually enrolled in
        const validClassIds = enrolledClasses.map(cls => cls._id.toString());
        
        // Filter requested classes to only include those the student is enrolled in
        const validRequestedClasses = requestedClasses.filter(cls => 
            validClassIds.includes(cls._id.toString())
        );
        
        if (validRequestedClasses.length === 0) {
            return res.status(403).json({ message: "Not enrolled in any of the requested classes", data: [] });
        }
        
        // Now process grades only for valid classes
        const gradesData = [];
        
        for (const classItem of validRequestedClasses) {
            const grades = await Grade.find({
                class: classItem._id,
                student: studentId,
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
            
            gradesData.push(gradeMapData);
        }
        
        return res.status(200).json(gradesData);
        
    } catch (err) {
        console.error("Error in getEnrolledClassesGrades:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
};


const generateChartData = async (req, res) => {
    const {schoolYear, dataType, selectedSubject, selectedQuarter} = req.query;
    const studentId = req.user._id;

    if(!studentId || !schoolYear || !dataType) {
        return res.status(400).json({ message: "Missing required parameters" });
    }

    try {
        // Validate school year against the Config model
        const config = await Config.findOne();
        if (!config || !config.schoolYears.includes(schoolYear)) {
            return res.status(400).json({ message: "Invalid school year requested" });
        }

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
                
                // Validate selectedSubject is one of student's enrolled classes
                if (!classIds.some(id => id.toString() === selectedSubject)) {
                    return res.status(403).json({ message: "You are not enrolled in this subject" });
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
                
                // Validate that the quarter is a legitimate value
                const validQuarters = ["Q1", "Q2", "Q3", "Q4"];
                if (!validQuarters.includes(selectedQuarter)) {
                    return res.status(400).json({ message: "Invalid quarter selected" });
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