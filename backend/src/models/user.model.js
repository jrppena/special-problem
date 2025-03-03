import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minLength: 6 },
    accountStatus: { type: String, default: "Pending", enum: ["Pending", "Verified", "Rejected"]},
    role: { 
      type: String, 
      required: true, 
      enum: ["Student", "Teacher", "Admin"]
    },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }]
  },
  {
    timestamps: true,
    discriminatorKey: "role",
  }
);

const User = mongoose.model("User", userSchema);
export default User;
