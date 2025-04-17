import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import Admin from '../models/admin.model.js';
import {generateToken}  from '../config/utils.js';
import {cloudinary} from '../config/cloudinary.js';

// In auth-controller.js, modify the signup function:
const signup = async (req, res) => {
    try {
        // Destructure only the expected fields and validate types
        const {first_name, last_name, email, password, role, gradeLevel} = req.body;
        
        // Validate required fields are strings
        if (typeof first_name !== 'string' || 
            typeof last_name !== 'string' || 
            typeof email !== 'string' || 
            typeof password !== 'string' ||
            typeof role !== 'string') {
            return res.status(400).json({message: "Invalid input format"});
        }
        
        
        // Validate role is one of the expected values
        const allowedRoles = ['Student', 'Teacher', 'Admin'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({message: "Invalid role"});
        }

        const existingUser = await User.findOne({email}).exec();
        if(existingUser){
            return res.status(400).json({message: "User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const roleModels = {
            Student,
            Teacher,
            Admin
        };
        
        let user = new roleModels[role]({
            firstName: first_name,
            lastName: last_name,
            email,
            password: hashedPassword,
            role
        });

        if(gradeLevel && typeof gradeLevel === 'string'){
            user.gradeLevel = parseInt(gradeLevel.split(" ")[1]);
        }

        if(user){
            generateToken(user._id, res);
            await user.save();
            return res.status(201).json({message: "User created successfully"});
        }else{
            return res.status(400).json({message: "Invalid user data"});
        }

    }catch(error){
        console.log("Error in signup: ", error);
        return res.status(400).json({message: "Invalid input data"});
    }
}

// In auth-controller.js, modify the login function:
const login = async (req, res) => {
    const {email, password} = req.body;

    try {
        // Validate inputs before proceeding
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({message: "Invalid Credentials"});
        }
        
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid Credentials"});
        }
        
        const isPasswordCorrect = user.password.startsWith('$2')
            ? await bcrypt.compare(password, user.password)
            : password === user.password;

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        generateToken(user._id, res);
        return res.status(200).json({_id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role});

    } catch (error) {
        console.log("Error in login: ", error.message);
        // Don't expose error details to client
        return res.status(400).json({message: "Invalid Credentials"});
    }
}

const logout = (req, res) => {
   try{
        res.cookie("jwt", "", {
            maxAge: 0,
        });
        return res.status(200).json({message: "User logged out successfully"})

   }catch(error){
        return res.status(500).json({message: "Something went wrong"});
   }
}

const updateProfile = async (req, res) => {
    try {
        // Extract and validate the expected fields
        const { contact_number, address, selectedImage, didChangeImage } = req.body;
        
        // Type validation
        if ((contact_number !== undefined && typeof contact_number !== 'string') ||
            (address !== undefined && typeof address !== 'string') ||
            (didChangeImage !== undefined && typeof didChangeImage !== 'boolean')) {
            return res.status(400).json({ message: "Invalid input format" });
        }
        
        const userId = req.user._id;

        // Fetch current user data
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        let updateData = {}; // Object to store only changed fields

        // Check if profile picture needs to be updated
        if (didChangeImage && selectedImage) {
            // Validate image data format if needed
            const uploadResponse = await cloudinary.uploader.upload(selectedImage);
            updateData.profilePic = uploadResponse.secure_url;
        }

        // Check if contact number or address has changed before updating
        if (contact_number !== undefined && contact_number !== currentUser.contactNumber) {
            updateData.contactNumber = contact_number;
        }
        
        if (address !== undefined && address !== currentUser.address) {
            updateData.address = address;
        }

        // If no changes, return a response without updating the database
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "There aren't any changes to update" });
        }

        // Update user in the database with only the changed fields
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.log("Error in updateProfile: ", error.message);
        return res.status(400).json({ message: "Invalid input data" });
    }
};

const checkAuth = (req, res) => {
    try{
        return res.status(200).json(req.user);
    }catch(error){
        console.log("Error in checkAuth: ", error.message);
        return res.status(500).json({message: "Something went wrong"});
    }
}


export const authRoutes = {
    signup,
    login,
    logout,
    updateProfile,
    checkAuth
}