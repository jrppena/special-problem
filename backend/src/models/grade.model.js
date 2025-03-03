import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema({
  gradingPeriod: { 
    type: String, 
    required: true, 
    enum: ["Q1", "Q2", "Q3", "Q4"] // ✅ Supports Quarterly Grading
  },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true }, // ✅ Link grade to a specific class
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true }, // ✅ Link grade to a student
  gradeValue: { type: Number, required: true, min: 0, max: 100 } // ✅ Numeric grading system (0-100)
});

const Grade = mongoose.model("Grade", gradeSchema);
export default Grade;
