import mongoose from "mongoose";
import User from "./user.model.js"; // Assuming Student is a discriminator of User


const studentSchema = new mongoose.Schema({
  gradeLevel: { type: Number, default: 7, required: true }, // ✅ Grade
  currentSection: { type: mongoose.Schema.Types.ObjectId, default: null, ref: "Section" }, // ✅ Current Section
  previousSections: [
    {
      section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" }, // ✅ Past Section
    }
  ],
});

const Student = User.discriminator("Student", studentSchema);
export default Student;
