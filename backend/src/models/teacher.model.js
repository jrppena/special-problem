  import mongoose from "mongoose";
import User from "./user.model.js"; // Assuming Teacher is a discriminator of User

const teacherSchema = new mongoose.Schema({
  assignedSections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }], // Sections where the teacher is an adviser
  assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }], // Classes they teach
  subjects: [{ type: String }], // List of subjects they can teach
});

const Teacher = User.discriminator("Teacher", teacherSchema);
export default Teacher;
