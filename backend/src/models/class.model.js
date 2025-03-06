import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  subjectName: { type: String, required: true }, // e.g., "Mathematics 10"
  gradeLevel: { type: Number, required: true, enum:[7,8,9,10,11,12] }, // e.g., 7, 8, 9, 10
  schoolYear: { type: String, required: true }, // e.g., "2024-2025"
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true }, // Assigned teacher
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true }], // ✅ Linked to a section
});

const Class = mongoose.model("Class", classSchema);
export default Class;
