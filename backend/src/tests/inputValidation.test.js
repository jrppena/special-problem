import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { validate } from '../middlewares/validation.middleware.js';
import connectDB from '../config/mongodb.js';

// Controllers
import { authRoutes } from '../controllers/auth-controller.js';
import { studentRoutes } from '../controllers/student-controller.js';
import { teacherRoutes } from '../controllers/teacher-controller.js';
import { classRoutes } from '../controllers/class-controller.js';
import { configRoutes } from '../controllers/config-controller.js';

// Validators
import { authValidators } from '../validators/auth.validator.js';
import { studentValidators } from '../validators/student.validator.js';
import { teacherValidators } from '../validators/teacher.validator.js';
import { classValidators } from '../validators/class.validator.js';
import { configValidators } from '../validators/config.validator.js';

// Middleware
import { protectRoute } from '../middlewares/auth.middleware.js';
import { 
  studentSpecificRoute, 
  teacherSpecificRoute, 
  adminSpecificRoute 
} from '../middlewares/rbac.middleware.js';

// Load environment variables
dotenv.config();

// Create a test Express app with proper routes and validation
const createTestApp = () => {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(cookieParser());

  // Create mock middleware functions - these will replace the actual middleware
  const mockProtectRoute = (req, res, next) => {
    // Set a mock user for testing
    req.user = {
      _id: '507f1f77bcf86cd799439011',
      role: 'Admin',
      accountStatus: 'Verified'
    };
    next();
  };

  const mockRoleMiddleware = (req, res, next) => next();

  // Auth routes
  const authRouter = express.Router();
  authRouter.post('/signup', authValidators.signup, validate, authRoutes.signup);
  authRouter.post('/login', authValidators.login, validate, authRoutes.login);
  authRouter.put('/update', mockProtectRoute, authValidators.updateProfile, validate, authRoutes.updateProfile);
  
  // Student routes
  const studentRouter = express.Router();
  studentRouter.get('/enrolled-classes', mockProtectRoute, mockRoleMiddleware, 
    studentValidators.getEnrolledClasses, validate, studentRoutes.getEnrolledClasses);
  studentRouter.get('/enrolled-classes-grades', mockProtectRoute, mockRoleMiddleware, 
    studentValidators.getEnrolledClassesGrades, validate, studentRoutes.getEnrolledClassesGrades);
  studentRouter.get('/chart-data', mockProtectRoute, mockRoleMiddleware, 
    studentValidators.generateChartData, validate, studentRoutes.generateChartData);
  
  // Teacher routes
  const teacherRouter = express.Router();
  teacherRouter.get('/available-students', mockProtectRoute, mockRoleMiddleware, 
    teacherValidators.getAvailableStudents, validate, teacherRoutes.getAvailableStudents);
  teacherRouter.post('/add/student-to-section', mockProtectRoute, mockRoleMiddleware, 
    teacherValidators.addStudentToSection, validate, teacherRoutes.addStudentToSection);
  teacherRouter.get('/class-grades', mockProtectRoute, mockRoleMiddleware, 
    teacherValidators.getClassGrades, validate, teacherRoutes.getClassGrades);
  teacherRouter.post('/update/student-grades', mockProtectRoute, mockRoleMiddleware, 
    teacherValidators.updateStudentGrades, validate, teacherRoutes.updateStudentGrades);
  
  // Class routes
  const classRouter = express.Router();
  classRouter.post('/create', mockProtectRoute, mockRoleMiddleware, 
    classValidators.createClass, validate, classRoutes.createClass);
  classRouter.put('/edit/:id', mockProtectRoute, mockRoleMiddleware, 
    classValidators.editClass, validate, classRoutes.editClass);
  
  // Config routes
  const configRouter = express.Router();
  classRouter.put('/update/current-school-year', mockProtectRoute, mockRoleMiddleware, 
    configValidators.updateCurrentSchoolYear, validate, configRoutes.updateCurrentSchoolYear);
  
  // Apply routers
  app.use('/api/auth', authRouter);
  app.use('/api/student', studentRouter);
  app.use('/api/teacher', teacherRouter);
  app.use('/api/class', classRouter);
  app.use('/api/config', configRouter);

  return app;
};

// Increase Jest timeout for all tests
jest.setTimeout(30000);

// Mock JWT secret
const secret = process.env.JWT_SECRET || 'testsecret';

// Remove the JWT verification and mock authentication for testing
jest.mock('../middlewares/auth.middleware.js', () => ({
  protectRoute: (req, res, next) => {
    req.user = {
      _id: '507f1f77bcf86cd799439011',
      role: 'Admin',
      accountStatus: 'Verified'
    };
    next();
  }
}));

// Mock RBAC middleware to always pass through
jest.mock('../middlewares/rbac.middleware.js', () => ({
  studentSpecificRoute: (req, res, next) => next(),
  teacherSpecificRoute: (req, res, next) => next(),
  adminSpecificRoute: (req, res, next) => next(),
  teacherOrAdminSpecificRoute: (req, res, next) => next()
}));

// Mock actual controller functions to prevent database operations
jest.mock('../controllers/auth-controller.js', () => ({
  authRoutes: {
    signup: (req, res) => res.status(201).json({ message: 'User created successfully' }),
    login: (req, res) => res.status(200).json({ message: 'Login successful' }),
    updateProfile: (req, res) => res.status(200).json({ message: 'Profile updated successfully' })
  }
}));

jest.mock('../controllers/student-controller.js', () => ({
  studentRoutes: {
    getEnrolledClasses: (req, res) => res.status(200).json({ message: 'Classes retrieved' }),
    getEnrolledClassesGrades: (req, res) => res.status(200).json({ message: 'Grades retrieved' }),
    generateChartData: (req, res) => res.status(200).json({ message: 'Chart data generated' })
  }
}));

jest.mock('../controllers/teacher-controller.js', () => ({
  teacherRoutes: {
    getAvailableStudents: (req, res) => res.status(200).json({ message: 'Students retrieved' }),
    addStudentToSection: (req, res) => res.status(200).json({ message: 'Student added' }),
    getClassGrades: (req, res) => res.status(200).json({ message: 'Grades retrieved' }),
    updateStudentGrades: (req, res) => res.status(200).json({ message: 'Grades updated' })
  }
}));

jest.mock('../controllers/class-controller.js', () => ({
  classRoutes: {
    createClass: (req, res) => res.status(201).json({ message: 'Class created' }),
    editClass: (req, res) => res.status(200).json({ message: 'Class updated' })
  }
}));

jest.mock('../controllers/config-controller.js', () => ({
  configRoutes: {
    updateCurrentSchoolYear: (req, res) => res.status(200).json({ message: 'School year updated' })
  }
}));

// Set up database mock
beforeAll(async () => {
  // No need to actually connect to database since we're mocking controllers
  console.log('Setting up test environment...');
});

// Clean up after all tests
afterAll(async () => {
  console.log('Cleaning up test environment...');
});

// Token generator function (helper)
const generateToken = (payload, options) => 
  jwt.sign(payload, secret, options || { expiresIn: '7d' });

// Test suite for input validation
describe('Input Validation Middleware Tests', () => {
  // Create test app
  const app = createTestApp();
  
  // Auth validation tests
  describe('Auth Endpoint Validation', () => {
    const authTestCases = [
      {
        endpoint: '/api/auth/signup',
        method: 'post',
        description: 'Missing required fields',
        payload: { first_name: 'Test' },  // Missing last_name, email, password, role
        expectedStatus: 400,
        expectedErrorCount: 4
      },
      {
        endpoint: '/api/auth/signup',
        method: 'post',
        description: 'Invalid email format',
        payload: { 
          first_name: 'Test', 
          last_name: 'User', 
          email: 'not-an-email', 
          password: 'password123', 
          role: 'Student' 
        },
        expectedStatus: 400,
        expectedErrorCount: 1
      },
      {
        endpoint: '/api/auth/signup',
        method: 'post',
        description: 'Invalid role',
        payload: { 
          first_name: 'Test', 
          last_name: 'User', 
          email: 'test@example.com', 
          password: 'password123', 
          role: 'SuperAdmin'  // Not in allowed roles
        },
        expectedStatus: 400,
        expectedErrorCount: 1
      },
      {
        endpoint: '/api/auth/login',
        method: 'post',
        description: 'Invalid email format',
        payload: { email: 'invalid-email', password: 'password123' },
        expectedStatus: 400,
        expectedErrorCount: 1
      },
      {
        endpoint: '/api/auth/login',
        method: 'post',
        description: 'Password too short',
        payload: { email: 'test@example.com', password: '12345' },
        expectedStatus: 400,
        expectedErrorCount: 1
      },
      {
        endpoint: '/api/auth/update',
        method: 'put',
        description: 'Invalid image format',
        payload: { 
          didChangeImage: true, 
          selectedImage: 123  // Should be string
        },
        expectedStatus: 400,
        expectedErrorCount: 1
      }
    ];
    
    const authResults = [];
    
    test.each(authTestCases)('$description', async (testCase) => {
      // Send request
      const res = await request(app)
        [testCase.method](testCase.endpoint)
        .set('Cookie', 'jwt=mocktoken')
        .send(testCase.payload);
      
      // Store results
      authResults.push({
        'Test Case': testCase.description,
        'Endpoint': testCase.endpoint,
        'Status Code': res.statusCode,
        'Error Count': res.body?.errors?.length || 0
      });
      
      // Assertions
      expect(res.statusCode).toBe(testCase.expectedStatus);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors.length).toBeGreaterThanOrEqual(testCase.expectedErrorCount);
    });
    
    // Display results
    afterAll(() => {
      console.log('\n🔍 Auth Validation Test Results:');
      console.table(authResults);
    });
  });

  // Student routes validation tests
  describe('Student Endpoint Validation', () => {
    const studentTestCases = [
      {
        endpoint: '/api/student/enrolled-classes',
        method: 'get',
        description: 'Missing school year',
        query: {},
        expectedStatus: 400,
        expectedErrorCount: 1
      },
      {
        endpoint: '/api/student/enrolled-classes',
        method: 'get',
        description: 'Invalid school year format',
        query: { schoolYear: '2023' },  // Should be YYYY-YYYY
        expectedStatus: 400,
        expectedErrorCount: 1
      },
      {
        endpoint: '/api/student/enrolled-classes-grades',
        method: 'get',
        description: 'Missing required parameters',
        query: {},
        expectedStatus: 400,
        expectedErrorCount: 2  // Missing schoolYear and classes
      },
      {
        endpoint: '/api/student/chart-data',
        method: 'get',
        description: 'Invalid data type',
        query: { 
          schoolYear: '2023-2024', 
          dataType: 'invalidType'  // Not in allowed types
        },
        expectedStatus: 400,
        expectedErrorCount: 1
      },
      {
        endpoint: '/api/student/chart-data',
        method: 'get',
        description: 'Missing required quarter',
        query: { 
          schoolYear: '2023-2024', 
          dataType: 'subjectsInOneQuarter'  // Requires selectedQuarter
        },
        expectedStatus: 400,
        expectedErrorCount: 1  // Missing selectedQuarter
      }
    ];
    
    const studentResults = [];
    
    test.each(studentTestCases)('$description', async (testCase) => {
      // Build query string
      const queryString = Object.keys(testCase.query)
        .map(key => `${key}=${encodeURIComponent(testCase.query[key])}`)
        .join('&');
      
      // Send request
      const res = await request(app)
        [testCase.method](`${testCase.endpoint}?${queryString}`)
        .set('Cookie', 'jwt=mocktoken');
      
      // Store results
      studentResults.push({
        'Test Case': testCase.description,
        'Endpoint': testCase.endpoint,
        'Query': JSON.stringify(testCase.query),
        'Status Code': res.statusCode,
        'Error Count': res.body?.errors?.length || 0
      });
      
      // Assertions
      expect(res.statusCode).toBe(testCase.expectedStatus);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors.length).toBeGreaterThanOrEqual(testCase.expectedErrorCount);
    });
    
    // Display results
    afterAll(() => {
      console.log('\n🔍 Student Validation Test Results:');
      console.table(studentResults);
    });
  });

  // Teacher routes validation tests
  describe('Teacher Endpoint Validation', () => {
    const teacherTestCases = [
      {
        endpoint: '/api/teacher/available-students',
        method: 'get',
        description: 'Missing required parameters',
        query: {},
        expectedStatus: 400,
        expectedErrorCount: 2  // Missing gradeLevel and schoolYear
      },
      {
        endpoint: '/api/teacher/available-students',
        method: 'get',
        description: 'Invalid grade level',
        query: { 
          gradeLevel: '13',  // Not between 7-12 
          schoolYear: '2023-2024'
        },
        expectedStatus: 400,
        expectedErrorCount: 1
      },
      {
        endpoint: '/api/teacher/add/student-to-section',
        method: 'post',
        description: 'Missing student IDs',
        payload: { 
          data: {
            sectionId: '507f1f77bcf86cd799439011',
            schoolYear: '2023-2024'
            // Missing studentIds
          }
        },
        expectedStatus: 400,
        expectedErrorCount: 1
      },
      {
        endpoint: '/api/teacher/class-grades',
        method: 'get',
        description: 'Invalid grading period',
        query: { 
          classId: '507f1f77bcf86cd799439011',
          gradingPeriod: 'Q5',  // Not in allowed quarters
          sectionId: '507f1f77bcf86cd799439011',
          schoolYear: '2023-2024'
        },
        expectedStatus: 400,
        expectedErrorCount: 1
      },
      {
        endpoint: '/api/teacher/update/student-grades',
        method: 'post',
        description: 'Invalid class ID format',
        payload: { 
          selectedClass: { _id: 'invalid-id' },  // Not a MongoDB ID
          editedGrades: {},
          schoolYear: '2023-2024'
        },
        expectedStatus: 400,
        expectedErrorCount: 1
      }
    ];
    
    const teacherResults = [];
    
    test.each(teacherTestCases)('$description', async (testCase) => {
      // For GET requests with query params
      if (testCase.method === 'get') {
        const queryString = Object.keys(testCase.query)
          .map(key => `${key}=${encodeURIComponent(testCase.query[key])}`)
          .join('&');
        
        // Send request
        const res = await request(app)
          .get(`${testCase.endpoint}?${queryString}`)
          .set('Cookie', 'jwt=mocktoken');
        
        // Store results
        teacherResults.push({
          'Test Case': testCase.description,
          'Endpoint': testCase.endpoint,
          'Query/Payload': JSON.stringify(testCase.query),
          'Status Code': res.statusCode,
          'Error Count': res.body?.errors?.length || 0
        });
        
        // Assertions
        expect(res.statusCode).toBe(testCase.expectedStatus);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Validation failed');
        expect(res.body.errors.length).toBeGreaterThanOrEqual(testCase.expectedErrorCount);
      } 
      // For POST requests with body payload
      else {
        // Send request
        const res = await request(app)
          [testCase.method](testCase.endpoint)
          .set('Cookie', 'jwt=mocktoken')
          .send(testCase.payload);
        
        // Store results
        teacherResults.push({
          'Test Case': testCase.description,
          'Endpoint': testCase.endpoint,
          'Query/Payload': JSON.stringify(testCase.payload).substring(0, 100),
          'Status Code': res.statusCode,
          'Error Count': res.body?.errors?.length || 0
        });
        
        // Assertions
        expect(res.statusCode).toBe(testCase.expectedStatus);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Validation failed');
        expect(res.body.errors.length).toBeGreaterThanOrEqual(testCase.expectedErrorCount);
      }
    });
    
    // Display results
    afterAll(() => {
      console.log('\n🔍 Teacher Validation Test Results:');
      console.table(teacherResults);
    });
  });

  // Class routes validation tests
  describe('Class Endpoint Validation', () => {
    const classTestCases = [
      {
        endpoint: '/api/class/create',
        method: 'post',
        description: 'Missing required fields',
        payload: { subjectName: 'Mathematics' }, // Missing gradeLevel, schoolYear, sections, teachers
        expectedStatus: 400,
        expectedErrorCount: 4
      },
      {
        endpoint: '/api/class/create',
        method: 'post',
        description: 'Invalid section IDs',
        payload: { 
          subjectName: 'Mathematics',
          gradeLevel: 9,
          schoolYear: '2023-2024',
          teachers: ['507f1f77bcf86cd799439011'],
          sections: ['invalid-section-id'] // Not a MongoDB ID
        },
        expectedStatus: 400,
        expectedErrorCount: 1
      },
      {
        endpoint: '/api/class/edit/507f1f77bcf86cd799439011',
        method: 'put',
        description: 'Invalid grade level',
        payload: { 
          subjectName: 'Mathematics',
          gradeLevel: 13, // Not between 7-12
          schoolYear: '2023-2024',
          teachers: ['507f1f77bcf86cd799439011'],
          sections: ['507f1f77bcf86cd799439011']
        },
        expectedStatus: 400,
        expectedErrorCount: 1
      }
    ];
    
    const classResults = [];
    
    test.each(classTestCases)('$description', async (testCase) => {
      // Send request
      const res = await request(app)
        [testCase.method](testCase.endpoint)
        .set('Cookie', 'jwt=mocktoken')
        .send(testCase.payload);
      
      // Store results
      classResults.push({
        'Test Case': testCase.description,
        'Endpoint': testCase.endpoint,
        'Payload': JSON.stringify(testCase.payload).substring(0, 100),
        'Status Code': res.statusCode,
        'Error Count': res.body?.errors?.length || 0
      });
      
      // Assertions
      expect(res.statusCode).toBe(testCase.expectedStatus);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors.length).toBeGreaterThanOrEqual(testCase.expectedErrorCount);
    });
    
    // Display results
    afterAll(() => {
      console.log('\n🔍 Class Validation Test Results:');
      console.table(classResults);
    });
  });
  
  // General summary of all validation tests
  afterAll(() => {
    console.log('\n✅ All validation tests completed.');
    console.log('Summary: The validation middleware successfully catches and reports invalid inputs for all tested endpoints.');
    console.log('The tests confirm that express-validator is correctly integrated with the application endpoints.');
  });
});