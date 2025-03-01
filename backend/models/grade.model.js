import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema({
    gradingPeriod: { type: String, required: true },
    subject: { type: String, required: true },
    gradeValue: { type: String, required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true }
  });
  
const Grade = mongoose.model("Grade", gradeSchema);
export default Grade;
  