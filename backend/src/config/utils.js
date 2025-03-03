import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
export const generateToken = (userId, res) =>{
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    res.cookie('jwt', token, {
        httpOnly: true, // Prevents client-side JS from reading the cookie
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
        sameSite: "strict", // Cookie is sent only in first-party contexts
        secure: process.env.NODE_ENV !== 'development'
    });

    return token;
};

