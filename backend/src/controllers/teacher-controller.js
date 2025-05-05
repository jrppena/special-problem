import Teacher from '../models/teacher.model.js';
import Section from '../models/section.model.js';
import Student from '../models/student.model.js';
import Class from '../models/class.model.js';
import Grade from '../models/grade.model.js';
import Config from '../models/config.model.js';

const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).json(teachers);
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

        // Validate school year
        const config = await Config.findOne();
        if (!config || !config.schoolYears.includes(schoolYear)) {
            return res.status(400).json({ message: "Invalid school year requested" });
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
            academicStatus: "Regular",
        });

        return res.status(200).json(availableStudents);
    } catch (error) {
        console.log("Error in getAvailableStudents: ", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const addStudentToSection = async (req, res) => {
    const { sectionId, studentIds, schoolYear } = req.body.data;
    const userId = req.user._id;

    try {
        // Validate school year
        const config = await Config.findOne();
        if (!config || !config.schoolYears.includes(schoolYear)) {
            return res.status(400).json({ message: "Invalid school year requested" });
        }

        // Add students to the section in the database
        const updatedSection = await Section.findOneAndUpdate(
            {
                _id: sectionId,
                advisers: { $in: [userId] }, // Ensure the user is an adviser of the section
                schoolYear: schoolYear // Ensure correct school year
            },
            {
                $push: { students: { $each: studentIds } }
            },
            {
                new: true // Return the updated document
            }
        ).populate('students'); // Populate the students

        if (!updatedSection) {
            return res.status(404).json({ success: false, message: 'Section not found or you are not authorized' });
        }

        // Double-check authorization (though this should be redundant with the query above)
        if (updatedSection.advisers.includes(userId) === false) {
            return res.status(403).json({ success: false, message: "Forbidden: You are not an adviser of this section" });
        }

        res.json({ success: true, updatedSection });
    } catch (error) {
        console.error("Error in addStudentToSection:", error);
        res.status(500).json({ success: false, message: 'Failed to add student to section' });
    }
};

const removeStudentFromSection = async (req, res) => {
    const { sectionId, studentId } = req.body;
    const userId = req.user._id; // Get the authenticated user's ID from the request

    try {
        const section = await Section.findById(sectionId).populate('students');

        if (!section) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }

        // Validate school year if provided in request
        if (req.body.schoolYear) {
            const config = await Config.findOne();
            if (!config || !config.schoolYears.includes(req.body.schoolYear)) {
                return res.status(400).json({ message: "Invalid school year requested" });
            }

            // Verify section belongs to requested school year
            if (section.schoolYear !== req.body.schoolYear) {
                return res.status(400).json({ message: "Section does not belong to specified school year" });
            }
        }

        if (!section.advisers.includes(userId)) {
            return res.status(403).json({ success: false, message: 'Forbidden: You are not an adviser of this section' });
        }

        const studentExistsInSection = section.students.some(student => student._id.toString() === studentId.toString());
        if (!studentExistsInSection) {
            return res.status(400).json({ success: false, message: 'Student not found in this section' });
        }

        // Check if the student has grades in the current school year
        const grade = await Grade.find({ student: studentId, schoolYear: section.schoolYear });
        if (grade && grade.length > 0) {
            return res.status(400).json({ success: false, message: 'Cannot remove student from section. Student has grades' });
        }

        // Remove the student from the section's students array
        section.students = section.students.filter(student => student._id.toString() !== studentId.toString());

        // Save the updated section
        const updatedSection = await section.save();

        // Populate the students field
        await updatedSection.populate('students');

        return res.status(200).json({ success: true, updatedSection });
    } catch (error) {
        console.error("Error in removeStudentFromSection:", error.message);
        return res.status(500).json({ success: false, message: 'Failed to remove student from section' });
    }
};

const getAssignedClasses = async (req, res) => {
    const userId = req.user._id;
    const schoolYear = req.query.schoolYear;

    try {
        // Validate school year
        const config = await Config.findOne();
        if (!config || !config.schoolYears.includes(schoolYear)) {
            return res.status(400).json({ message: "Invalid school year requested" });
        }

        const classes = await Class.find({ teachers: { $in: [userId] }, schoolYear: schoolYear })
            .populate({
                path: 'sections', // First populate sections
                populate: {
                    path: 'students', // Then populate students inside sections
                    model: 'Student' // Ensure correct model reference
                }
            });

        // Filter sections to only include those where the teacher is an adviser or the class teacher
        const filteredClasses = classes.map(classItem => {
            // Create a copy to avoid modifying the original
            const classCopy = classItem.toObject();

            // Filter sections where teacher is an adviser or class teacher
            classCopy.sections = classCopy.sections.filter(section =>
                section.advisers.some(adviser => adviser.toString() === userId.toString()) ||
                classItem.teachers.some(teacher => teacher.toString() === userId.toString())
            );

            return classCopy;
        });

        res.status(200).json(filteredClasses);
    } catch (error) {
        console.error("Error in getAssignedClasses:", error);
        res.status(404).json({ message: error.message });
    }
}

const getClassGrades = async (req, res) => {
    const classId = req.query.classId;
    const gradingPeriod = req.query.gradingPeriod;
    const sectionId = req.query.sectionId;
    const schoolYear = req.query.schoolYear;
    const userId = req.user._id;
    try {
        // Validate school year
        const config = await Config.findOne();
        if (!config || !config.schoolYears.includes(schoolYear)) {
            return res.status(400).json({ message: "Invalid school year requested" });
        }
        // Fetch the section with populated students
        const section = await Section.findById(sectionId).populate('students', '_id');

        if (!section) {
            return res.status(404).json({ message: "Section not found" });
        }
        // Verify section belongs to requested school year
        if (section.schoolYear !== schoolYear) {
            return res.status(400).json({ message: "Section does not belong to specified school year" });
        }

        const assignedClass = await Class.findById(classId).populate('teachers', '_id');

        if (!assignedClass) {
            return res.status(404).json({ message: "Class not found" });
        }

        // Verify class belongs to requested school year
        if (assignedClass.schoolYear !== schoolYear) {
            return res.status(400).json({ message: "Class does not belong to specified school year" });
        }

        // Verify the section is associated with this class
        if (!assignedClass.sections.some(s => s.toString() === sectionId)) {
            return res.status(400).json({ message: "Section is not associated with this class" });
        }

        if (!assignedClass.teachers.some(teacher => teacher._id.equals(userId)) && req.user.role === "Teacher") {
            return res.status(403).json({ message: "Forbidden: You are not authorized to view the class grades of this class" });
        }

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
            if (grade.student && grade.student._id && gradeMap[grade.student._id]) {
                gradeMap[grade.student._id] = {
                    ...gradeMap[grade.student._id],
                    [grade.gradingPeriod]: grade.gradeValue,
                };
            }
        });

        res.status(200).json(gradeMap);

    } catch (error) {
        console.error("Error in getClassGrades:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// Fetch and format existing grades into a lookup table
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

// Validate grade value (0-100) and return numeric value or error
const validateGradeValue = (value) => {
    const numericGrade = parseInt(value);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
        return null; // Invalid grade
    }
    return numericGrade;
};

const updateStudentGrades = async (req, res) => {
    try {
        const { selectedClass, editedGrades, schoolYear } = req.body;
        const userId = req.user._id;

        if (!selectedClass || !editedGrades || typeof editedGrades !== "object") {
            return res.status(400).json({ error: "Invalid input data." });
        }

        // Validate school year if provided
        if (schoolYear) {
            const config = await Config.findOne();
            if (!config || !config.schoolYears.includes(schoolYear)) {
                return res.status(400).json({ message: "Invalid school year requested" });
            }
            if (config.currentSchoolYear !== schoolYear && req.user.role === "Teacher") {
                return res.status(400).json({ message: "You cannot update grades for school years other than the current school year" });
            }
        }

        // Verify the class exists and user is authorized
        const classDetails = await Class.findById(selectedClass).populate('teachers');

        if (!classDetails) {
            return res.status(404).json({ error: "Class not found." });
        }

        if (!classDetails.teachers.some(teacher => teacher._id.equals(userId)) && req.user.role === "Teacher") {
            return res.status(403).json({ message: "Forbidden: You are not authorized to update grades for this class" });
        }

        // Verify all students exist in a section of this class
        const studentIds = Object.keys(editedGrades);
        const sections = await Section.find({
            _id: { $in: classDetails.sections }
        });

        const allStudentsInSections = sections.flatMap(section =>
            section.students.map(student => student.toString())
        );

        const invalidStudents = studentIds.filter(id => !allStudentsInSections.includes(id));
        if (invalidStudents.length > 0) {
            return res.status(400).json({
                error: "Some students are not enrolled in this class",
                invalidStudents
            });
        }

        const bulkOperations = [];
        const existingGradesMap = await getExistingGradesMap(selectedClass);

        // Prepare bulk operations
        for (const studentId in editedGrades) {
            for (const gradingPeriod in editedGrades[studentId]) {
                const gradeValue = validateGradeValue(editedGrades[studentId][gradingPeriod]);

                if (gradeValue !== null) {
                    const currentGradeInDB = existingGradesMap[studentId]?.[gradingPeriod] ?? "-";

                    // Only update if the grade actually changed
                    if (gradeValue !== currentGradeInDB) {
                        bulkOperations.push({
                            updateOne: {
                                filter: { class: selectedClass, student: studentId, gradingPeriod },
                                update: { $set: { gradeValue } },
                                upsert: true, // Creates new entry if not found
                            }
                        });
                    }
                }
            }
        }

        // Execute batch update if there are changes
        if (bulkOperations.length > 0) {
            await Grade.bulkWrite(bulkOperations);
        } else {
            return res.status(200).json({ message: "No changes detected. Grades remain the same." });
        }

        // Fetch updated grades in a single query
        const updatedGrades = await Grade.find({
            class: selectedClass,
            gradingPeriod: { $in: ["Q1", "Q2", "Q3", "Q4"] },
            student: { $in: Object.keys(editedGrades) }
        }).populate("student", "_id");

        // Format updated grades into a structured object
        const updatedClassGrades = {};
        updatedGrades.forEach((grade) => {
            if (!updatedClassGrades[grade.student._id]) {
                updatedClassGrades[grade.student._id] = { Q1: "-", Q2: "-", Q3: "-", Q4: "-" };
            }
            updatedClassGrades[grade.student._id][grade.gradingPeriod] = grade.gradeValue;
        });

        return res.status(200).json({
            message: "Grades updated successfully.",
            updatedClassGrades
        });

    } catch (error) {
        console.error("Error updating student grades:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getChartData = async (req, res) => {
    const { classId, gradingPeriod, dataType, sectionId, studentIds } = req.query;
    const schoolYear = req.query.schoolYear;
    const userId = req.user._id;



    try {
        // Validate school year
        const config = await Config.findOne();
        console.log(schoolYear)
        console.log(config.schoolYears)
        if (!config || !config.schoolYears.includes(schoolYear)) {
            return res.status(400).json({ message: "Invalid school year requested" });
        }

        const assignedClass = await Class.findById(classId).populate('teachers', '_id');

        if (!assignedClass) {
            return res.status(404).json({ message: "Class not found" });
        }

        // Verify class belongs to requested school year
        if (assignedClass.schoolYear !== schoolYear) {
            return res.status(400).json({ message: "Class does not belong to specified school year" });
        }

        if (!assignedClass.teachers.some(teacher => teacher._id.equals(userId))) {
            return res.status(403).json({ message: "Forbidden: You are not authorized to view the class grades of this class" });
        }

        if (dataType === "singleSectionPerformance") {
            // Ensure a sectionId is provided
            if (!sectionId) {
                return res.status(400).json({ message: "sectionId is required for singleSectionPerformance" });
            }

            // Verify the section is associated with this class
            if (!assignedClass.sections.some(s => s.toString() === sectionId)) {
                return res.status(400).json({ message: "Section is not associated with this class" });
            }

            // Fetch the section and its students
            const section = await Section.findById(sectionId).populate("students");
            if (!section) {
                return res.status(404).json({ message: "Section not found" });
            }

            // Verify section belongs to requested school year
            if (section.schoolYear !== schoolYear) {
                return res.status(400).json({ message: "Section does not belong to specified school year" });
            }

            // Filter students if studentIds is provided
            let filteredStudents = section.students;
            if (studentIds && Array.isArray(JSON.parse(studentIds)) && JSON.parse(studentIds).length > 0) {
                const studentIdList = JSON.parse(studentIds);

                // Verify all requested students are in this section
                const invalidStudents = studentIdList.filter(id =>
                    !section.students.some(student => student._id.toString() === id)
                );

                if (invalidStudents.length > 0) {
                    return res.status(400).json({
                        message: "Some requested students are not in this section",
                        invalidStudents
                    });
                }

                filteredStudents = section.students.filter(student =>
                    studentIdList.includes(student._id.toString())
                );
            }

            // Initialize gradeMap for each student (default grade is 0)
            const gradeMap = {};
            filteredStudents.forEach((student) => {
                gradeMap[student._id] = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
            });

            // Build query criteria for fetching grades
            const queryCriteria = {
                class: classId,
                student: { $in: filteredStudents.map((s) => s._id) }
            };

            if (gradingPeriod === "all") {
                queryCriteria.gradingPeriod = { $in: ["Q1", "Q2", "Q3", "Q4"] };
            } else {
                // Validate grading period
                const validPeriods = ["Q1", "Q2", "Q3", "Q4"];
                if (!validPeriods.includes(gradingPeriod)) {
                    return res.status(400).json({ message: "Invalid grading period" });
                }
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
                filteredStudents.forEach((student) => {
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
                processedData = filteredStudents.map((student) => {
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
                // Verify each section belongs to the requested school year
                if (section.schoolYear !== schoolYear) {
                    return res.status(400).json({
                        message: "One or more sections do not belong to the specified school year"
                    });
                }

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
                // Validate grading period
                const validPeriods = ["Q1", "Q2", "Q3", "Q4"];
                if (!validPeriods.includes(gradingPeriod)) {
                    return res.status(400).json({ message: "Invalid grading period" });
                }
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

const getSpecificStudentGrades = async (req, res) => {
    const studentId = req.query.studentId;
    const sectionId = req.query.sectionId;
    const schoolYear = req.query.schoolYear;
    const userId = req.user._id;

    try {
        // Validate school year
        const config = await Config.findOne();
        if (!config || !config.schoolYears.includes(schoolYear)) {
            return res.status(400).json({ message: "Invalid school year requested" });
        }

        const section = await Section.findById(sectionId).populate('students', '_id');

        if (!section) {
            return res.status(404).json({ message: "Section not found" });
        }

        // Verify section belongs to requested school year
        if (section.schoolYear !== schoolYear) {
            return res.status(400).json({ message: "Section does not belong to specified school year" });
        }

        if (!section.advisers.includes(userId)) {
            return res.status(403).json({ message: "Forbidden: You are not an adviser of this section" });
        }

        // Verify the student is actually in the section
        if (!section.students.some(student => student._id.toString() === studentId)) {
            return res.status(403).json({ message: "Student is not enrolled in this section" });
        }

        // Fetch classes for the given sectionId and schoolYear
        const classes = await Class.find({
            sections: { $in: [sectionId] },
            schoolYear: schoolYear
        });

        if (!classes || classes.length === 0) {
            return res.status(404).json({ message: "No classes found for the given section and school year" });
        }

        const dummyGradesData = [];
        const quarterGrades = { Q1: [], Q2: [], Q3: [], Q4: [] };  // To store grades by quarter for overall average calculation

        // Iterate over each class
        for (const classItem of classes) {
            // Fetch grades for the given student, class, and school year
            const grades = await Grade.find({
                class: classItem._id,
                student: studentId,
            });

            // Initialize the object for this class
            const gradeMapData = {
                classId: classItem._id,
                className: classItem.subjectName, // Using subjectName as the class name
                grades: { Q1: "-", Q2: "-", Q3: "-", Q4: "-" }, // Set default grades as "-"
                average: "-" // Default average
            };

            let totalGrades = 0;
            let validGradesCount = 0;

            // Populate grades for each grading period (Q1, Q2, Q3, Q4)
            grades.forEach(grade => {
                if (gradeMapData.grades.hasOwnProperty(grade.gradingPeriod)) {
                    const gradeValue = grade.gradeValue;

                    // Check if the gradeValue is a valid number
                    if (typeof gradeValue === 'number' && !isNaN(gradeValue)) {
                        gradeMapData.grades[grade.gradingPeriod] = gradeValue.toString(); // Convert grade to string
                        totalGrades += gradeValue; // Add to total grades
                        validGradesCount++; // Increment valid grades count

                        // Add the grade to the respective quarter for overall average calculation
                        quarterGrades[grade.gradingPeriod].push(gradeValue);
                    }
                }
            });

            // Calculate the average for the subject (class) if there are valid grades
            if (validGradesCount > 0) {
                gradeMapData.average = (totalGrades / validGradesCount).toFixed(2); // Round to 2 decimal places
            } else {
                gradeMapData.average = "-"; // No valid grades available
            }

            // Push the gradeMapData object to dummyGradesData
            dummyGradesData.push(gradeMapData);
        }

        // Calculate the average for each quarter (Q1, Q2, Q3, Q4) across all subjects
        const quarterAverages = {};
        for (const quarter in quarterGrades) {
            const quarterGradeValues = quarterGrades[quarter];
            if (quarterGradeValues.length > 0) {
                const totalQuarter = quarterGradeValues.reduce((acc, value) => acc + value, 0); // Sum of grades for the quarter
                const quarterAverage = totalQuarter / quarterGradeValues.length; // Calculate average
                quarterAverages[quarter] = quarterAverage.toFixed(2); // Round to 2 decimal places
            } else {
                quarterAverages[quarter] = "-"; // No grades for this quarter
            }
        }

        const studentGrades = {
            classes: dummyGradesData,
            quarterAverages: quarterAverages
        };

        // Return both the per-subject grades and quarter averages
        res.status(200).json(studentGrades);

    } catch (err) {
        console.error("Error in getSpecificStudentGrades:", err);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const getSectionGrades = async (req, res) => {
    const { sectionId, schoolYear } = req.query;
    const userId = req.user._id;


    try {
        // Validate school year
        const config = await Config.findOne();

        if (!config || !config.schoolYears.includes(schoolYear)) {
            return res.status(400).json({ message: "Invalid school year requested" });
        }

        // Fetch the section and its students in one query, no need for separate calls
        const section = await Section.findOne({ _id: sectionId, schoolYear: schoolYear })
            .populate({
                path: 'students',
                select: '_id firstName lastName', // Select only the fields needed
            })
            .exec();

        // If no section found or no students in the section
        if (!section || !section.students.length) {
            return res.status(404).json({
                message: "No students found in this section",
            });
        }

        if (!section.advisers.includes(userId)) {
            return res.status(403).json({ message: "Forbidden: You are not an adviser of this section" });
        }

        // Fetch the grades for all students in the section and classes for the given schoolYear in one query
        const classes = await Class.find({
            sections: { $in: [sectionId] },
            schoolYear: schoolYear,
        }).select('_id subjectName'); // Select only the fields needed

        if (!classes || classes.length === 0) {
            return res.status(404).json({ message: "No classes found for this section in the specified school year" });
        }

        // Create a map of class IDs to class names
        const classMap = new Map(classes.map((classItem) => [classItem._id.toString(), classItem.subjectName]));

        // Aggregate all grades for the students in the section and school year
        const allGrades = await Grade.find({
            student: { $in: section.students.map((student) => student._id) },
            class: { $in: classes.map((classItem) => classItem._id) },
        }).exec();

        // Initialize an object to hold student grade data
        const studentsGradesData = section.students.map((student) => {
            const dummyGradesData = [];
            const quarterGrades = { Q1: [], Q2: [], Q3: [], Q4: [] };

            // Filter grades for this student
            const studentGrades = allGrades.filter((grade) => grade.student.toString() === student._id.toString());

            classes.forEach((classItem) => {
                const gradeMapData = {
                    classId: classItem._id,
                    className: classMap.get(classItem._id.toString()) || classItem.subjectName,
                    grades: { Q1: "-", Q2: "-", Q3: "-", Q4: "-" },
                    average: "-",
                };

                let totalGrades = 0;
                let validGradesCount = 0;

                // Populate grades for each grading period
                studentGrades
                    .filter((grade) => grade.class.toString() === classItem._id.toString())
                    .forEach((grade) => {
                        const gradeValue = grade.gradeValue;
                        if (typeof gradeValue === "number" && !isNaN(gradeValue)) {
                            if (gradeMapData.grades.hasOwnProperty(grade.gradingPeriod)) {
                                gradeMapData.grades[grade.gradingPeriod] = gradeValue.toString();
                                totalGrades += gradeValue;
                                validGradesCount++;

                                // Add the grade to the respective quarter for overall average calculation
                                quarterGrades[grade.gradingPeriod].push(gradeValue);
                            }
                        }
                    });

                // Calculate the average for the subject
                if (validGradesCount > 0) {
                    gradeMapData.average = (totalGrades / validGradesCount).toFixed(2);
                } else {
                    gradeMapData.average = "-";
                }

                dummyGradesData.push(gradeMapData);
            });

            // Calculate the average for each quarter across all subjects
            const quarterAverages = {};
            for (const quarter in quarterGrades) {
                const quarterGradeValues = quarterGrades[quarter];
                if (quarterGradeValues.length > 0) {
                    const totalQuarter = quarterGradeValues.reduce((acc, value) => acc + value, 0);
                    quarterAverages[quarter] = (totalQuarter / quarterGradeValues.length).toFixed(2);
                } else {
                    quarterAverages[quarter] = "-";
                }
            }

            return {
                studentId: student._id,
                studentName: `${student.firstName} ${student.lastName}`,
                classes: dummyGradesData,
                quarterAverages: quarterAverages,
            };
        });

        // Return students' grades data
        res.status(200).json(studentsGradesData);
    } catch (err) {
        console.error("Error in getSectionGrades:", err);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const teacherRoutes = {
    getTeachers,
    getAvailableStudents,
    addStudentToSection,
    removeStudentFromSection,
    getAssignedClasses,
    updateStudentGrades,
    getClassGrades,
    getChartData,
    getSpecificStudentGrades,
    getSectionGrades
};