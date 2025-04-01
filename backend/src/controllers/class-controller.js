import Class from '../models/class.model.js';
import Section from '../models/section.model.js';
import Student from '../models/student.model.js';


const fetchClasses = async (req, res) => {
    const { schoolYear } = req.params;
    try {
        const classes = await Class.find({ schoolYear })
        .populate({
          path: 'sections',
          populate: {
            path: 'students', // Populate the students array in each section
            model: 'Student', // Reference the Student model
          }
        })
        .populate('teachers'); // Populate teachers as well

        res.status(200).json(classes);
    } catch (error) {
        console.log('Error in fetchClasses: ', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const createClass = async (req, res) => {
    const { subjectName, gradeLevel, schoolYear, sections, teachers } = req.body;

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

const createClassThroughImport = async (req, res) => {
    try {
      const classesData = req.body;  // Receive the class data array from frontend
     if (!classesData || classesData.length === 0) {
        return res.status(400).json({ message: "No class data provided" });
      }
  
      // Validate and map the class data before inserting
      const createdClasses = [];
  
      for (let classData of classesData) {
        // Validation: Ensure required fields exist
        if (!classData.subjectName || !classData.gradeLevel || !classData.sections || !classData.teachers) {
          return res.status(400).json({ message: "Missing required class data fields" });
        }
  
        // Create the new class object (you can modify this to match your schema if necessary)
        const newClass = new Class({
          subjectName: classData.subjectName,
          gradeLevel: classData.gradeLevel,
          sections: classData.sections,  // Array of section IDs
          teachers: classData.teachers,  // Array of teacher IDs
          schoolYear: classData.schoolYear || "2024-2025", // Default school year
        });
  
        // Save the new class to the database
        const savedClass = await newClass.save();
        createdClasses.push(savedClass);
      }
  
      // Send response with the created class data
      res.status(201).json({
        message: "Classes created successfully",
        createdClasses,
      });
    } catch (error) {
      console.log('Error in createClassThroughImport: ', error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  };

  const deleteAllClassesGivenSchoolYear = async (req, res) => {
    const { schoolYear } = req.params;
    try {
        await Class.deleteMany({schoolYear: schoolYear});
        res.status(200).json({ message: 'All classes deleted successfully' });
    } catch (error) {
        console.log('Error in deleteAllClasses: ', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
  }

export const classRoutes = {
    fetchClasses,
    createClass,
    editClass,
    deleteClass,
    createClassThroughImport,
    deleteAllClassesGivenSchoolYear
}

