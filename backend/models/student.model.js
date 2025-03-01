import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    grades: [{ type: mongoose.Schema.Types.ObjectId, ref: "Grade" }],
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }]
  });
  
  const Student = User.discriminator("Student", studentSchema);
  export default Student;
  