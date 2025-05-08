import { config } from "dotenv";
import { connectDB } from "../config/mongodb.js";
import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js"; // Add student model if required
import { faker } from '@faker-js/faker';
import bcrypt from "bcryptjs";
import User from "../models/user.model.js"; // Assuming you have a User model

config();

/**
 * Generates unique student details with Faker
 * @param {Object} options - Optional configuration
 * @param {number} options.gradeLevel - Grade level to assign (default: random 6-12)
 * @param {string} options.defaultPassword - Default password to use (default: "Password123!")
 * @param {string} options.accountStatus - Account status (default: "Verified")
 * @returns {Promise<Object>} Student detail object
 */
const generateStudentDetail = async () => {
    
    // Generate basic user info
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    // Generate a unique email with retry logic and maximum attempts
    let email = null;
    let existingUser = null;
    let attempts = 0;
    const maxAttempts = 5;
    
    do {
        // Create different email variations after first attempt
        if (attempts === 0) {
            email = faker.internet.email({ firstName, lastName });
        } else {
            // Add random suffix for uniqueness in subsequent attempts
            const suffix = faker.string.alphanumeric(4);
            email = faker.internet.email({ firstName, lastName, provider: `example${suffix}.com` });
        }
        
        try {
            // Check if email already exists
            existingUser = await User.findOne({ email }).lean().exec();
            attempts++;
        } catch (error) {
            console.error("Error checking for existing user:", error);
            throw new Error("Database error when generating student details");
        }
    } while (existingUser && attempts < maxAttempts);
    
    // If we couldn't generate a unique email after max attempts
    if (existingUser) {
        throw new Error("Could not generate unique email after maximum attempts");
    }

    try {
        // Hash password with stronger security
        const salt = await bcrypt.genSalt(10); // Increased from 10 to 12
        const hashedPassword = await bcrypt.hash("123456", salt);
        
        // Use a more realistic avatar that won't make external requests
        const profilePic = faker.image.avatar(); // Use a local avatar image or a placeholder`;
        
        return {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profilePic,
            accountStatus: "Verified",
            role: "Student",
            gradeLevel: 12,
        };
    } catch (error) {
        console.error("Error generating student details:", error);
        throw new Error("Failed to generate student details");
    }
}


const seedDatabase = async () => {
  try {
    await connectDB();

    // const studentToGenerate = 60
    // let seedUsers = {
    //   students: [],
    // };

    // for (let i = 0; i < studentToGenerate; i++) {
    //   const studentDetail = await generateStudentDetail();
    //   seedUsers.students.push(studentDetail);
    // }
 
    // // Insert the teachers data with separated firstName and lastName
    // await Student.insertMany(seedUsers.students);

    const studentsToDelete = await Student.find({ gradeLevel: { $gt: 10 } });
    console.log("Database seeded successfully with students.");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();