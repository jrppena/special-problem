import mongoose from "mongoose";
import User from "./user.model.js"; // Assuming Admin is a discriminator of User

const adminSchema = new mongoose.Schema({
    managedTeachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }]
  });
  
  const Admin = User.discriminator("Admin", adminSchema);
  export default Admin;
  