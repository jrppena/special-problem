import Config from "../models/config.model.js";


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
    const currentSchoolYear = await Config.find("currentSchoolYear");

    if (!currentSchoolYear) {
        return res.status(404).json({ message: "No current school year found" });
    }
    res.status(200).json(currentSchoolYear);
}

const updateCurrentSchoolYear = async (req, res) => {
    const { currentSchoolYear } = req.body;

    try {
        await Config.updateOne({}, { currentSchoolYear });
        res.status(200).json({ message: "Current school year updated successfully" });
    } catch (error) {
        console.error("Error updating current school year:", error);
        res.status(500).json({ message: "Error updating current school year" });
    }
}

export const configRoutes={
    getAllSchoolYears,
    getCurrentSchoolYear,
    updateCurrentSchoolYear
}
