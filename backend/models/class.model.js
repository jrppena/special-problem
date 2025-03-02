import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Mathematics 10"
  subject: { type: String, required: true }, // e.g., "Mathematics"
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true }, // Assigned teacher
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true }, // ✅ Linked to a section
});

const Class = mongoose.model("Class", classSchema);
export default Class;
