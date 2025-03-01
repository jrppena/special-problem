import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    gradeLevel: { type: String, required: true },
    subject: { type: String, required: true },
    section: { type: String, required: true },
    schoolYear: { type: String, required: true }, // Example: "2024-2025"
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }
  });
  
const Class = mongoose.model("Class", classSchema);
export default Class;
  