import Section from '../models/section.model.js';
import Teacher from '../models/teacher.model.js';

const getAllSectionsGivenSchoolYear = async (req, res) => {
    const {schoolYear} = req.params;
    try {
        const sections = await Section.find({schoolYear}).populate('adviser');
        return res.status(200).json(sections);
    }
    catch(error){
        console.log("Error in getAllSectionsGivenSchoolYear: ", error);
        return res.status(500).json({message: "Something went wrong"});
    }
}


const createSection = async (req, res) => {
    const {name, gradeLevel, teacher, currentSchoolYear} = req.body;
    try {
       const existingSection = await Section.findOne
       ({name, gradeLevel, schoolYear: currentSchoolYear});
         if(existingSection){
              return res.status(400).json({message: "Section already exists"});
         }
            const section = new Section({
                name,
                gradeLevel,
                adviser: teacher,
                schoolYear: currentSchoolYear
            });
            await section.save();
            return res.status(201).json({message: "Section created successfully"});
    }
    catch(error){
        console.log("Error in createSection: ", error);
        return res.status(500).json({message: "Something went wrong"});
    }
}

const editSelectedSection = async (req, res) => {
    const {id} = req.params;
    const {name, gradeLevel, teacher, currentSchoolYear} = req.body;
    try {
        const section = await Section.findById(id);
        if(!section){
            return res.status(404).json({message: "Section not found"});
        }
        section.name = name;
        section.gradeLevel = gradeLevel;
        section.adviser = teacher;
        section.schoolYear = currentSchoolYear;
        await section.save();
        return res.status(200).json({message: "Section updated successfully"});
    }
    catch(error){
        console.log("Error in editSelectedSection: ", error);
        return res.status(500).json({message: "Something went wrong"});
    }
}

// Get all teachers who are not yet assigned as advisers for the current school year
const getAvailableAdvisers = async (req, res) => {
    const { schoolYear } = req.params;
    console.log("School year: ", schoolYear);
  try {

    // Get all teacher IDs that are already assigned as advisers in the given school year
    const assignedAdvisers = await Section.distinct("adviser", { schoolYear });

    // Find teachers who are NOT in the assigned advisers list
    const availableAdvisers = await Teacher.find({ _id: { $nin: assignedAdvisers }, accountStatus: "Verified" });

    console.log("Available advisers: ", availableAdvisers);

    res.status(200).json(availableAdvisers);
  } catch (error) {
    console.error("Error fetching available advisers:", error);
    res.status(500).json({ error: "Internal server error while fetching available advisers." });
  }
}



export const sectionRoutes = {
    getAllSectionsGivenSchoolYear,
    createSection,
    editSelectedSection,
    getAvailableAdvisers
}


