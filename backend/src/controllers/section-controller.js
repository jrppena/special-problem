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
    const {sectionName, gradeLevel, adviserId, schoolYear} = req.body;
    try {
        
        const adviser = await Teacher.findById(adviserId);
        
        if(!adviser){
            return res.status(404).json({message: "Adviser not found"});
        }

        const existingSection = await Section.findOne({name: sectionName,  schoolYear});
        if(existingSection){
            return res.status(400).json({message: "Section already exists"});
        }
        
        const newSection = new Section({
            name: sectionName,
            gradeLevel: gradeLevel,
            adviser: adviser,
            schoolYear
        });

        await newSection.save();

        console.log("Section created successfully");
        return res.status(201).json({message: "Section created successfully"});
    }
    catch(error){
        console.log("Error in createSection: ", error);
        return res.status(500).json({message: "Something went wrong"});
    }
}

const editSelectedSection = async (req, res) => {
    const {id} = req.params;
    const {sectionName,  adviser} = req.body;
    let {gradeLevel} = req.body;

    if (typeof gradeLevel === "string") {
        gradeLevel = parseInt(gradeLevel.split(" ")[1], 10);
    }
    
    try {
        const section = await Section.findById(id);
        if(!section){
            return res.status(404).json({message: "Section not found"});
        }
        section.name = sectionName;
        section.gradeLevel = gradeLevel;
        section.adviser = adviser;
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
  try {

    // Get all teacher IDs that are already assigned as advisers in the given school year
    const assignedAdvisers = await Section.distinct("adviser", { schoolYear });

    // Find teachers who are NOT in the assigned advisers list
    const availableAdvisers = await Teacher.find({ _id: { $nin: assignedAdvisers }, accountStatus: "Verified" });

    res.status(200).json(availableAdvisers);
  } catch (error) {
    console.error("Error fetching available advisers:", error);
    res.status(500).json({ error: "Internal server error while fetching available advisers." });
  }
}

const deleteSelectedSection = async (req, res) => {
    const { id } = req.params;
    try {
        const section = await Section.findByIdAndDelete(id);
        
        if (!section) {
            return res.status(404).json({ message: "Section not found" });
        }
        return res.status(200).json({ message: "Section deleted successfully", schoolYear: section.schoolYear });
    } catch (error) {
        console.error("Error in deleteSelectedSection: ", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};


const getAdviserSections = async (req, res) => {
    const userId = req.params.id;
    const schoolYear = req.params.schoolYear; // Read schoolYear from query parameters

    try {
        const sections = await Section.find({ adviser: userId, schoolYear: schoolYear }).populate('students');
        console.log("Sections: ", sections);
        res.status(200).json(sections);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};




export const sectionRoutes = {
    getAllSectionsGivenSchoolYear,
    createSection,
    editSelectedSection,
    getAvailableAdvisers,
    deleteSelectedSection,
    getAdviserSections
}


