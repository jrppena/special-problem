import mongoose, { trusted } from "mongoose";

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: trusted }, // e.g., "7-Einstein", "7-Newton", "8-Earth"
  gradeLevel: { type: Number, required: true }, // e.g., 7, 8, 9, 10
  adviser: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }, // Section adviser
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // Enrolled students
  schoolYear: { type: String, required: true }, // e.g., "2024-2025"
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }], // ✅ List of subjects taken by the section
});

const Section = mongoose.model("Section", sectionSchema);
export default Section;
