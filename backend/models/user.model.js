import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minLength: 6 },
    isVerified: { type: Boolean, default: false },
    role: { 
      type: String, 
      required: true, 
      enum: ["Student", "Teacher", "Admin"]
    }
  },
  {
    timestamps: true,
    discriminatorKey: "role",
  }
);

const User = mongoose.model("User", userSchema);
export default User;
