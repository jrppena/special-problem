const teacherSchema = new mongoose.Schema({
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }]
  });
  
  const Teacher = User.discriminator("Teacher", teacherSchema);
  export default Teacher;
  