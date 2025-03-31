import { config } from "dotenv";
import { connectDB } from "../config/mongodb.js";
import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";  // Assuming you have a Student model
import { faker } from '@faker-js/faker';  // Import Faker.js

config();

// Function to generate a random user with Pending account status and check for unique email
const generatePendingUser = async (role, existingEmails) => {
  let email;

  // Ensure the email is unique by checking if it already exists in the existingEmails set or the database
  do {
    email = faker.internet.email();
  } while (existingEmails.has(email) || await Student.findOne({ email }));

  existingEmails.add(email);  // Add the new email to the set to ensure it's unique

  return {
    email: email,
    firstName: faker.person.firstName(),  // Use faker.person for first name
    lastName: faker.person.lastName(),    // Use faker.person for last name
    password: "123456",  // You can change this to a hashed password if required
    profilePic: faker.image.avatar(),
    accountStatus: "Pending",  // Account status set to "Pending"
    role: role,
    gradeLevel: faker.number.int({ min: 7, max: 10 }),  // Use faker.number.int for random numbers
  };
};

// Function to seed the database with unique emails
const seedDatabase = async () => {
  try {
    await connectDB();

    // Set to store unique email addresses
    const existingEmails = new Set();

    // Generate 10 users with Pending account status and unique emails
    const pendingUsers = [];
    for (let i = 0; i < 10; i++) {
      const user = await generatePendingUser('Student', existingEmails);
      pendingUsers.push(user);
    }

    // Insert the pending students data
    await Student.insertMany(pendingUsers);

    console.log("Database seeded successfully with pending students.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function to seed the database
seedDatabase();
