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
    {
      email: "jgalag@gmail.com",
      firstName: "Jaymar",
      lastName: "Galag",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/10.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
  ],

  teachers: [
    // Teachers
    {
      email: "ajgalang@gmail.com",
      firstName: "Ara Jane",
      lastName: "Galang",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "sheenabelleca@gmail.com",
      firstName: "Sheena",
      lastName: "Belleca",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "jmpascua@gmail.com",
      firstName: "Jamica",
      lastName: "Pascua",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "rzepe@gmail.com",
      firstName: "Rachel",
      lastName: "Zape",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "mrbelano@gmail.com",
      firstName: "Mary Rose",
      lastName: "Belano",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/5.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "mfperiera@gmail.com",
      firstName: "Ma. Ferly",
      lastName: "Periera",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/6.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "mjreconcillo@gmail.com",
      firstName: "Mark Joffet",
      lastName: "Reconcillo",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/7.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "mabotial@gmail.com",
      firstName: "Michelle Ann",
      lastName: "Botial",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/8.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "ccaballero@gmail.com",
      firstName: "Catherine",
      lastName: "Caballero",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/9.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "cabugao@gmail.com",
      firstName: "Catherine",
      lastName: "Abugao",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/10.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "jsiarot@gmail.com",
      firstName: "Jennifer",
      lastName: "Siarot",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/10.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "jlgarcera@gmail.com",
      firstName: "John Leroy",
      lastName: "Garcera",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/10.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "gconmigo@gmail.com",
      firstName: "Generoso",
      lastName: "Conmigo",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/10.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "ehpacamarra@gmail.com",
      firstName: "Earl Henrick",
      lastName: "Pacamarra",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/10.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "hrpunto@gmail.com",
      firstName: "Helen",
      lastName: "Punto",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/10.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
    {
      email: "jbgutierrez@gmail.com",
      firstName: "Janely",
      lastName: "Gutierrez",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/10.jpg",
      accountStatus: "Verified",
      role: "Teacher",
    },
  ],
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data before seeding new data (Optional)
    await Teacher.deleteMany({});
    // You can also seed the students data if needed
    // await Student.deleteMany({});
    // await Student.insertMany(studentsWithNames);

    // Insert the teachers data with separated firstName and lastName
    await Teacher.insertMany(seedUsers.teachers);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();
