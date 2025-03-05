import { config } from "dotenv";
import { connectDB } from "../config/mongodb.js";
import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js"; // Add student model if required

config();

const seedUsers = {
  students: [
    // Students
    {
      email: "emma.thompson@example.com",
      fullName: "Emma Thompson",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/1.jpg",
      accountStatus: "Verified",
      role: "Student",
    },
    {
      email: "olivia.miller@example.com",
      fullName: "Olivia Miller",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
      accountStatus: "Verified",
      role: "Student",
    },
    {
      email: "sophia.davis@example.com",
      fullName: "Sophia Davis",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/3.jpg",
      accountStatus: "Verified",
      role: "Student",
    },
    {
      email: "ava.wilson@example.com",
      fullName: "Ava Wilson",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/4.jpg",
      accountStatus: "Verified",
      role: "Student",
    },
    {
      email: "isabella.brown@example.com",
      fullName: "Isabella Brown",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/5.jpg",
      accountStatus: "Verified",
      role: "Student",
    },
    {
      email: "mia.johnson@example.com",
      fullName: "Mia Johnson",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/6.jpg",
      accountStatus: "Verified",
      role: "Student",
    },
    {
      email: "charlotte.williams@example.com",
      fullName: "Charlotte Williams",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/7.jpg",
      accountStatus: "Verified",
      role: "Student",
    },
    {
      email: "amelia.garcia@example.com",
      fullName: "Amelia Garcia",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/8.jpg",
      accountStatus: "Verified",
      role: "Student",
    },
  ],

  teachers: [
    // Teachers
    {
      email: "james.anderson@example.com",
      fullName: "James Anderson",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "william.clark@example.com",
      fullName: "William Clark",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "benjamin.taylor@example.com",
      fullName: "Benjamin Taylor",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "lucas.moore@example.com",
      fullName: "Lucas Moore",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "henry.jackson@example.com",
      fullName: "Henry Jackson",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/5.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "alexander.martin@example.com",
      fullName: "Alexander Martin",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/6.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "daniel.rodriguez@example.com",
      fullName: "Daniel Rodriguez",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/7.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "michael.walker@example.com",
      fullName: "Michael Walker",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/8.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "david.harris@example.com",
      fullName: "David Harris",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/9.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "richard.martinez@example.com",
      fullName: "Richard Martinez",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/10.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
  ],
};

// Function to split fullName into firstName and lastName
const splitName = (fullName) => {
  const [firstName, lastName] = fullName.split(" ");
  return { firstName, lastName };
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Process students and teachers to split fullName into firstName and lastName
    const studentsWithNames = seedUsers.students.map((student) => {
      const { firstName, lastName } = splitName(student.fullName);
      return {
        ...student,
        firstName,
        lastName,
      };
    });

    const teachersWithNames = seedUsers.teachers.map((teacher) => {
      const { firstName, lastName } = splitName(teacher.fullName);
      return {
        ...teacher,
        firstName,
        lastName,
      };
    });

    // Clear existing data before seeding new data (Optional)
    await Teacher.deleteMany({});
    // You can also seed the students data if needed
    // await Student.deleteMany({});
    // await Student.insertMany(studentsWithNames);

    // Insert the teachers data with separated firstName and lastName
    await Teacher.insertMany(teachersWithNames);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();
