import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import {generateToken}  from '../config/utils.js';

const signup = async (req, res) => {
    const {first_name, last_name, email, password, role} = req.body;
    const is_verified = false;
    try{
        const existingUser = await User
            .findOne({email})
            .exec();
        if(existingUser){
            return res.status(400).json({message: "User already exists"});
        }
        if(password.length < 6){
            return res.status(400).json({message: "Password should be at least 6 characters"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
         
        const user = new User({
            firstName: first_name,
            lastName: last_name,
            email: email,
            password: hashedPassword,
            isVerified: is_verified,
            role: role
        });

        if(user){
            generateToken(user._id, res);
            await user.save();
            return res.status(201).json({message: "User created successfully"});
        }else{
            return res.status(400).json({message: "Invalid user data"});
        }

    }catch(error){
        console.log("Error in signup: ", error);
        return res.status(500).json({message: "Something went wrong"});
    }
}

const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(40).json({message: "Invalid Credentials"});
        }
         
        const isPasswordCorrect = await bcrypt.compare(password,user.password)
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid Credentials"});
        }

        generateToken(user._id, res);
        return res.status(200).json({_id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role});

    } catch (error) {
        return res.status(500).json({message: "Something went wrong"});

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

const checkAuth = (req, res) => {
    try{
        return res.status(200).json(req.user);
    }catch(error){
        console.log("Error in checkAuth: ", error.message);
        return res.status(500).json({message: "Something went wrong"});
    }
}


export const userRoutes = {
    signup,
    login,
    logout,
    checkAuth
}