import Class from '../models/class.model.js';
import Section from '../models/section.model.js';
import Student from '../models/student.model.js';


const fetchClasses = async (req, res) => {
    const { schoolYear } = req.params;
    try {
        const classes = await Class.find({ schoolYear }).populate('sections').populate('teachers');

        res.status(200).json(classes);
    } catch (error) {
        console.log('Error in fetchClasses: ', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const createClass = async (req, res) => {
    const { subjectName, gradeLevel, schoolYear, sections, teachers } = req.body;

    console.log(subjectName, gradeLevel, schoolYear, sections, teachers);

    try {
        // Step 1: Check if a class already exists for the same subject, grade level, and school year
        const existingClass = await Class.findOne({
            subjectName,
            gradeLevel,
            schoolYear,
            sections: { $in: sections } // Check if any of the sections are already assigned to the class
        });

        if (existingClass) {
            return res.status(400).json({
                message: `A class that is similar is already being taught in one of your assigned sections. Please try again`
            ,success:false});
        }

        // Step 2: If no existing class, create the new class
        const newClass = new Class({
            subjectName,
            gradeLevel,
            schoolYear,
            sections,
            teachers
        });

        await newClass.save();

        res.status(201).json({ message: 'Class created successfully', class: newClass });
    } catch (error) {
        console.log('Error creating class:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};


const editClass = async (req, res) => {
    const { id } = req.params; // Class ID to be updated
    const { subjectName, gradeLevel, schoolYear, sections, teachers } = req.body;

    try {
        // Step 1: Check if a class already exists with the same subjectName, gradeLevel, schoolYear, and sections
        // Exclude the class being edited from the check (by excluding its own ID from the query)
        const existingClass = await Class.findOne({
            subjectName,
            gradeLevel,
            schoolYear,
            sections: { $in: sections }, // Check if any of the sections are already assigned
            _id: { $ne: id } // Exclude the current class being edited by its ID
        });

        if (existingClass) {
            return res.status(400).json({
                message: `A class that is similar is already being taught in one of your assigned sections. Please try again.`,
                success: false
            });
        }

        // Step 2: Update the class if no similar class is found
        const updatedClass = await Class.findByIdAndUpdate(id, {
            subjectName,
            gradeLevel,
            schoolYear,
            sections,
            teachers
        }, { new: true }); // `new: true` will return the updated document

        if (!updatedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        res.status(200).json({ message: 'Class updated successfully', class: updatedClass });
    } catch (error) {
        console.log('Error in editClass: ', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};


const deleteClass = async (req, res) => {
    const { id } = req.params;

    try {
        // Step 1: Check if the class exists
        const classToDelete = await Class.findById(id);

        if (!classToDelete) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Step 2: Check if the class has any students
        const studentsInClass = await Student.find({ class: id });

        if (studentsInClass.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete the class as it has students enrolled in it. Please remove the students first.'
            });
        }

        // Step 3: Delete the class if no students are enrolled
        await Class.findByIdAndDelete(id);

        res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
        console.log('Error in deleteClass: ', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}


export const classRoutes = {
    fetchClasses,
    createClass,
    editClass,
    deleteClass
}

