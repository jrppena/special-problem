import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { adminSpecificRoute, studentSpecificRoute, teacherSpecificRoute } from '../middlewares/rbac.middleware.js';
import User from '../models/user.model.js';
import connectDB from '../config/mongodb.js';

// Import route handlers (mock these since we're just testing middleware)
import { adminRoutes } from '../controllers/admin-controller.js';
import { studentRoutes } from '../controllers/student-controller.js';
import { teacherRoutes } from '../controllers/teacher-controller.js';

// Load environment variables
dotenv.config();

// Create a test Express app
const createTestApp = () => {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(cookieParser());

  // Create test routers
  const adminRouter = express.Router();
  const studentRouter = express.Router();
  const teacherRouter = express.Router();

  // Mock route handlers
  adminRoutes.getPendingUsers = (req, res) => res.status(200).json({ message: 'Admin route accessed successfully' });
  studentRoutes.getEnrolledClasses = (req, res) => res.status(200).json({ message: 'Student route accessed successfully' });
  teacherRoutes.getAssignedClasses = (req, res) => res.status(200).json({ message: 'Teacher route accessed successfully' });
  
  // Add the routes with appropriate middleware chains
  adminRouter.get('/pending-users', protectRoute, adminSpecificRoute, adminRoutes.getPendingUsers);
  studentRouter.get('/enrolled-classes', protectRoute, studentSpecificRoute, studentRoutes.getEnrolledClasses);
  teacherRouter.get('/assigned-classes', protectRoute, teacherSpecificRoute, teacherRoutes.getAssignedClasses);

  // Mount the routers
  app.use('/api/admin', adminRouter);
  app.use('/api/student', studentRouter);
  app.use('/api/teacher', teacherRouter);

  return app;
};

// Increase Jest timeout for all tests
jest.setTimeout(30000);

// Define user IDs for different roles
let adminUserId;
let teacherUserId;
let studentUserId;
const secret = process.env.JWT_SECRET || 'testsecret';

// Set up database connection before tests
beforeAll(async () => {
  try {
    // Connect to database
    await connectDB();

    // Find an admin user for testing or create one
    const adminUser = await User.findOne({ role: 'Admin' }).select('_id');
    if (!adminUser) {
      const newAdminUser = new User({
        firstName: 'Test',
        lastName: 'Admin',
        email: 'test.admin@example.com',
        password: 'hashedpassword',
        role: 'Admin',
        accountStatus: 'Verified'
      });
      await newAdminUser.save();
      adminUserId = newAdminUser._id.toString();
    } else {
      adminUserId = adminUser._id.toString();
      // Ensure user has Verified status
      await User.findByIdAndUpdate(adminUserId, { accountStatus: 'Verified' });
    }

    // Find or create a teacher user
    const teacherUser = await User.findOne({ role: 'Teacher' }).select('_id');
    if (!teacherUser) {
      const newTeacherUser = new User({
        firstName: 'Test',
        lastName: 'Teacher',
        email: 'test.teacher@example.com',
        password: 'hashedpassword',
        role: 'Teacher',
        accountStatus: 'Verified'
      });
      await newTeacherUser.save();
      teacherUserId = newTeacherUser._id.toString();
    } else {
      teacherUserId = teacherUser._id.toString();
      await User.findByIdAndUpdate(teacherUserId, { accountStatus: 'Verified' });
    }

    // Find or create a student user
    const studentUser = await User.findOne({ role: 'Student' }).select('_id');
    if (!studentUser) {
      const newStudentUser = new User({
        firstName: 'Test',
        lastName: 'Student',
        email: 'test.student@example.com',
        password: 'hashedpassword',
        role: 'Student',
        accountStatus: 'Verified'
      });
      await newStudentUser.save();
      studentUserId = newStudentUser._id.toString();
    } else {
      studentUserId = studentUser._id.toString();
      await User.findByIdAndUpdate(studentUserId, { accountStatus: 'Verified' });
    }

    console.log('Setup adminUserId:', adminUserId);
    console.log('Setup teacherUserId:', teacherUserId);
    console.log('Setup studentUserId:', studentUserId);
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
});

// Clean up after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

// Token generator function
const generateToken = (payload) => 
  jwt.sign(payload, secret, { expiresIn: '7d' });

// Main test suite
describe('Role-Based Access Control Tests', () => {
  // Create test app for the test suite
  const app = createTestApp();
  
  // Define the protected routes for testing
  const adminRoute = '/api/admin/pending-users';
  const studentRoute = '/api/student/enrolled-classes';
  const teacherRoute = '/api/teacher/assigned-classes';

  // Define test cases for role-based access
  const testCases = [
    // Admin access tests
    { 
      description: 'Admin accessing admin route', 
      route: adminRoute,
      role: 'Admin',
      userId: () => adminUserId,
      expectedStatus: 200
    },
    { 
      description: 'Admin accessing student route', 
      route: studentRoute,
      role: 'Admin',
      userId: () => adminUserId,
      expectedStatus: 403
    },
    { 
      description: 'Admin accessing teacher route', 
      route: teacherRoute,
      role: 'Admin',
      userId: () => adminUserId,
      expectedStatus: 403
    },
    
    // Teacher access tests
    { 
      description: 'Teacher accessing admin route', 
      route: adminRoute,
      role: 'Teacher',
      userId: () => teacherUserId,
      expectedStatus: 403
    },
    { 
      description: 'Teacher accessing student route', 
      route: studentRoute,
      role: 'Teacher',
      userId: () => teacherUserId,
      expectedStatus: 403
    },
    { 
      description: 'Teacher accessing teacher route', 
      route: teacherRoute,
      role: 'Teacher',
      userId: () => teacherUserId,
      expectedStatus: 200
    },
    
    // Student access tests
    { 
      description: 'Student accessing admin route', 
      route: adminRoute,
      role: 'Student',
      userId: () => studentUserId,
      expectedStatus: 403
    },
    { 
      description: 'Student accessing student route', 
      route: studentRoute,
      role: 'Student',
      userId: () => studentUserId,
      expectedStatus: 200
    },
    { 
      description: 'Student accessing teacher route', 
      route: teacherRoute,
      role: 'Student',
      userId: () => studentUserId,
      expectedStatus: 403
    }
  ];

  // Create an array to store test results
  const testResults = [];

  // Run all test cases
  testCases.forEach((testCase, index) => {
    test(`${index + 1}. ${testCase.description}`, async () => {
      const token = generateToken({ userId: testCase.userId() });
      const res = await request(app)
        .get(testCase.route)
        .set('Cookie', `jwt=${token}`);
      
      // Store result in testResults
      testResults.push({
        'Test Case': testCase.description,
        'Route': testCase.route,
        'User Role': testCase.role,
        'Status Code': res.statusCode,
        'Access': res.statusCode === 200 ? 'Allowed' : 'Denied',
        'Response Message': res.body?.message || 'No message'
      });

      // Verify the status code matches our expectation
      expect(res.statusCode).toBe(testCase.expectedStatus);
      
      // Verify response content
      if (testCase.expectedStatus === 200) {
        expect(res.body.message).toContain('accessed successfully');
      } else if (testCase.expectedStatus === 403) {
        expect(res.body.message).toContain('Access denied');
      }
    });
  });

  // After all tests, display the results in a table
  afterAll(() => {
    console.log('\n🔐 Role-Based Access Control Test Results:');
    console.table(testResults);
  });
});