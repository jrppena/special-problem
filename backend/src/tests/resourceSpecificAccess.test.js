import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { protectRoute, teacherSpecificRoute, studentSpecificRoute } from '../middlewares/auth.middleware.js';
import User from '../models/user.model.js';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import Section from '../models/section.model.js';
import Class from '../models/class.model.js';
import Grade from '../models/grade.model.js';
import Config from '../models/config.model.js';
import connectDB from '../config/mongodb.js';

// Import controllers
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
  const studentRouter = express.Router();
  const teacherRouter = express.Router();

  // Student routes for testing resource access
  studentRouter.get('/enrolled-classes', protectRoute, studentSpecificRoute, studentRoutes.getEnrolledClasses);
  studentRouter.get('/enrolled-classes-grades', protectRoute, studentSpecificRoute, studentRoutes.getEnrolledClassesGrades);
  studentRouter.get('/chart-data', protectRoute, studentSpecificRoute, studentRoutes.generateChartData);

  // Teacher routes for testing resource access
  teacherRouter.get('/get/class-grades', protectRoute, teacherSpecificRoute, teacherRoutes.getClassGrades);
  teacherRouter.post('/update/student-grades', protectRoute, teacherSpecificRoute, teacherRoutes.updateStudentGrades);
  teacherRouter.get('/get/specific-student-grades', protectRoute, teacherSpecificRoute, teacherRoutes.getSpecificStudentGrades);
  teacherRouter.get('/get/section-grades', protectRoute, teacherSpecificRoute, teacherRoutes.getSectionGrades);

  // Mount the routers
  app.use('/api/student', studentRouter);
  app.use('/api/teacher', teacherRouter);

  return app;
};

// Increase Jest timeout for all tests
jest.setTimeout(30000);

// Define IDs for test entities
let student1Id, student2Id;
let teacher1Id, teacher2Id;
let section1Id, section2Id;
let class1Id, class2Id;
let schoolYear = "2024-2025";
const secret = process.env.JWT_SECRET || 'testsecret';

// Set up database connection and test data before tests
beforeAll(async () => {
  try {
    // Connect to database
    await connectDB();

    // Create config with school year
    await Config.findOneAndUpdate(
      {}, 
      { 
        currentSchoolYear: schoolYear,
        schoolYears: [schoolYear, "2023-2024"]
      },
      { upsert: true }
    );

    // Create test students
    const student1 = await Student.findOneAndUpdate(
      { email: 'student1@test.com' },
      {
        firstName: 'Student',
        lastName: 'One',
        email: 'student1@test.com',
        password: 'hashedpassword',
        role: 'Student',
        accountStatus: 'Verified',
        gradeLevel: 10,
        academicStatus: 'Regular'
      },
      { upsert: true, new: true }
    );
    student1Id = student1._id;

    const student2 = await Student.findOneAndUpdate(
      { email: 'student2@test.com' },
      {
        firstName: 'Student',
        lastName: 'Two',
        email: 'student2@test.com',
        password: 'hashedpassword',
        role: 'Student',
        accountStatus: 'Verified',
        gradeLevel: 10,
        academicStatus: 'Regular'
      },
      { upsert: true, new: true }
    );
    student2Id = student2._id;

    // Create test teachers
    const teacher1 = await Teacher.findOneAndUpdate(
      { email: 'teacher1@test.com' },
      {
        firstName: 'Teacher',
        lastName: 'One',
        email: 'teacher1@test.com',
        password: 'hashedpassword',
        role: 'Teacher',
        accountStatus: 'Verified'
      },
      { upsert: true, new: true }
    );
    teacher1Id = teacher1._id;

    const teacher2 = await Teacher.findOneAndUpdate(
      { email: 'teacher2@test.com' },
      {
        firstName: 'Teacher',
        lastName: 'Two',
        email: 'teacher2@test.com',
        password: 'hashedpassword',
        role: 'Teacher',
        accountStatus: 'Verified'
      },
      { upsert: true, new: true }
    );
    teacher2Id = teacher2._id;

    // Create test sections
    const section1 = await Section.findOneAndUpdate(
      { name: '10-Alpha', schoolYear },
      {
        name: '10-Alpha',
        gradeLevel: 10,
        advisers: [teacher1Id],
        students: [student1Id],
        schoolYear
      },
      { upsert: true, new: true }
    );
    section1Id = section1._id;

    const section2 = await Section.findOneAndUpdate(
      { name: '10-Beta', schoolYear },
      {
        name: '10-Beta',
        gradeLevel: 10,
        advisers: [teacher2Id],
        students: [student2Id],
        schoolYear
      },
      { upsert: true, new: true }
    );
    section2Id = section2._id;

    // Create test classes
    const class1 = await Class.findOneAndUpdate(
      { subjectName: 'Mathematics 10', schoolYear },
      {
        subjectName: 'Mathematics 10',
        gradeLevel: 10,
        teachers: [teacher1Id],
        sections: [section1Id],
        schoolYear
      },
      { upsert: true, new: true }
    );
    class1Id = class1._id;

    const class2 = await Class.findOneAndUpdate(
      { subjectName: 'Science 10', schoolYear },
      {
        subjectName: 'Science 10',
        gradeLevel: 10,
        teachers: [teacher2Id],
        sections: [section2Id],
        schoolYear
      },
      { upsert: true, new: true }
    );
    class2Id = class2._id;

    console.log('Test data setup complete');
    console.log('Student 1 ID:', student1Id);
    console.log('Student 2 ID:', student2Id);
    console.log('Teacher 1 ID:', teacher1Id);
    console.log('Teacher 2 ID:', teacher2Id);
    console.log('Section 1 ID:', section1Id);
    console.log('Section 2 ID:', section2Id);
    console.log('Class 1 ID:', class1Id);
    console.log('Class 2 ID:', class2Id);
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
describe('Resource-Specific Access Control Tests', () => {
  // Create test app for the test suite
  const app = createTestApp();
  
  // Define an array to store test results for better reporting
  const testResults = [];
  
  // Test suite for student resource access
  describe('Student Resource Access Tests', () => {
    test('Student can access their own enrolled classes', async () => {
      const token = generateToken({ userId: student1Id });
      const res = await request(app)
        .get(`/api/student/enrolled-classes?schoolYear=${schoolYear}`)
        .set('Cookie', `jwt=${token}`);
      
      const result = {
        'Test Case': 'Student accessing own enrolled classes',
        'User': 'Student 1',
        'Resource': `Classes for ${schoolYear}`,
        'Status Code': res.statusCode,
        'Access': res.statusCode === 200 ? 'Allowed' : 'Denied',
        'Response': res.body?.message || JSON.stringify(res.body).substring(0, 50) + '...'
      };
      testResults.push(result);
      
      expect(res.statusCode).toBe(200);
    });

    // Add these to the Student Resource Access Tests section

    test('Student can access their own grades', async () => {
        const token = generateToken({ userId: student1Id });
        
        // Get the classes for this student
        const ownClasses = [
          {
            _id: class1Id,
            subjectName: 'Mathematics 10'
          }
        ];
        
        const res = await request(app)
          .get('/api/student/enrolled-classes-grades')
          .query({
            classes: JSON.stringify(ownClasses),
            schoolYear: schoolYear
          })
          .set('Cookie', `jwt=${token}`);
        
        const result = {
          'Test Case': 'Student accessing own grades',
          'User': 'Student 1',
          'Resource': 'Own grades',
          'Status Code': res.statusCode,
          'Access': res.statusCode === 200 ? 'Allowed' : 'Denied',
          'Response': res.body?.message || JSON.stringify(res.body).substring(0, 50) + '...'
        };
        testResults.push(result);
        
        expect(res.statusCode).toBe(200);
      });
      
      test('Student cannot access another student\'s grades', async () => {
        const token = generateToken({ userId: student1Id });
        
        // Try to access classes of another student
        const otherStudentClasses = [
          {
            _id: class2Id,
            subjectName: 'Science 10'
          }
        ];
        
        const res = await request(app)
          .get('/api/student/enrolled-classes-grades')
          .query({
            classes: JSON.stringify(otherStudentClasses),
            schoolYear: schoolYear
          })
          .set('Cookie', `jwt=${token}`);
        
        const result = {
          'Test Case': 'Student accessing another student\'s grades',
          'User': 'Student 1',
          'Resource': 'Student 2\'s grades',
          'Status Code': res.statusCode,
          'Access': res.statusCode === 200 ? 'Allowed' : 'Denied',
          'Response': res.body?.message || JSON.stringify(res.body).substring(0, 50) + '...'
        };
        testResults.push(result);
        
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain('Not enrolled in any of the requested classes');
      });

    test('Student cannot access non-existent school year', async () => {
      const token = generateToken({ userId: student1Id });
      const res = await request(app)
        .get('/api/student/enrolled-classes?schoolYear=invalid-year')
        .set('Cookie', `jwt=${token}`);
      
      const result = {
        'Test Case': 'Student accessing invalid school year',
        'User': 'Student 1',
        'Resource': 'Classes for invalid-year',
        'Status Code': res.statusCode,
        'Access': res.statusCode === 200 ? 'Allowed' : 'Denied',
        'Response': res.body?.message || JSON.stringify(res.body).substring(0, 50) + '...'
      };
      testResults.push(result);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Invalid school year');
    });

    test('Student can access their own chart data', async () => {
      const token = generateToken({ userId: student1Id });
      const res = await request(app)
        .get(`/api/student/chart-data?schoolYear=${schoolYear}&dataType=subjectsAcrossQuarters`)
        .set('Cookie', `jwt=${token}`);
      
      const result = {
        'Test Case': 'Student accessing own chart data',
        'User': 'Student 1',
        'Resource': 'Chart data for own grades',
        'Status Code': res.statusCode,
        'Access': res.statusCode === 200 || res.statusCode === 204 ? 'Allowed' : 'Denied',
        'Response': res.body?.message || JSON.stringify(res.body).substring(0, 50) + '...'
      };
      testResults.push(result);
      
      // 204 is also acceptable (no content if no grades yet)
      expect([200, 204]).toContain(res.statusCode);
    });

    test('Student cannot manipulate studentId - only sees their own data', async () => {
        // Generate token for Student 1
        const token = generateToken({ userId: student1Id });
        
        // Attempt to access chart data with a studentId in the query (which should be ignored)
        const res = await request(app)
          .get(`/api/student/chart-data?schoolYear=${schoolYear}&dataType=subjectsAcrossQuarters&studentId=${student2Id}`)
          .set('Cookie', `jwt=${token}`);
        
        const result = {
          'Test Case': 'Student adding studentId to query parameters',
          'User': 'Student 1',
          'Resource': 'Chart data with studentId parameter',
          'Status Code': res.statusCode,
          'Access': 'Allowed (shows own data)',
          'Response': res.body?.message || JSON.stringify(res.body).substring(0, 50) + '...'
        };
        testResults.push(result);
        
        // The server should ignore the studentId parameter and use the authenticated user's ID
        expect(res.statusCode).toBe(200);
        
        // Verify that the data is for Student 1's classes and not Student 2's classes
        if (res.body.data && res.body.data.length > 0) {
          // Get class names from the response to verify it's only classes that Student 1 is enrolled in
          const responseClassNames = res.body.data.map(item => item.name);
          
          // Student 1 should only see "Mathematics 10" (class1) and not "Science 10" (class2)
          expect(responseClassNames).toContain('Mathematics 10');
          expect(responseClassNames).not.toContain('Science 10');
        }
      });
  });

  // Test suite for teacher resource access
  describe('Teacher Resource Access Tests', () => {
    test('Teacher can access class grades for their classes', async () => {
      const token = generateToken({ userId: teacher1Id });
      const res = await request(app)
        .get(`/api/teacher/get/class-grades?classId=${class1Id}&sectionId=${section1Id}&gradingPeriod=all&schoolYear=${schoolYear}`)
        .set('Cookie', `jwt=${token}`);
      
      const result = {
        'Test Case': 'Teacher accessing own class grades',
        'User': 'Teacher 1',
        'Resource': 'Class 1 grades',
        'Status Code': res.statusCode,
        'Access': res.statusCode === 200 ? 'Allowed' : 'Denied',
        'Response': res.body?.message || JSON.stringify(res.body).substring(0, 50) + '...'
      };
      testResults.push(result);
      
      expect(res.statusCode).toBe(200);
    });

    test('Teacher cannot access class grades for classes they do not teach', async () => {
      const token = generateToken({ userId: teacher1Id });
      const res = await request(app)
        .get(`/api/teacher/get/class-grades?classId=${class2Id}&sectionId=${section2Id}&gradingPeriod=all&schoolYear=${schoolYear}`)
        .set('Cookie', `jwt=${token}`);
      
      const result = {
        'Test Case': 'Teacher accessing other teacher\'s class grades',
        'User': 'Teacher 1',
        'Resource': 'Class 2 grades',
        'Status Code': res.statusCode,
        'Access': res.statusCode === 200 ? 'Allowed' : 'Denied',
        'Response': res.body?.message || JSON.stringify(res.body).substring(0, 50) + '...'
      };
      testResults.push(result);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('not authorized');
    });

    test('Teacher can access student grades for sections they advise', async () => {
      const token = generateToken({ userId: teacher1Id });
      const res = await request(app)
        .get(`/api/teacher/get/specific-student-grades?studentId=${student1Id}&sectionId=${section1Id}&schoolYear=${schoolYear}`)
        .set('Cookie', `jwt=${token}`);
      
      const result = {
        'Test Case': 'Teacher accessing student grades for advised section',
        'User': 'Teacher 1',
        'Resource': 'Student 1 grades',
        'Status Code': res.statusCode,
        'Access': res.statusCode === 200 ? 'Allowed' : 'Denied',
        'Response': res.body?.message || JSON.stringify(res.body).substring(0, 50) + '...'
      };
      testResults.push(result);
      
      expect(res.statusCode).toBe(200);
    });

    test('Teacher cannot access student grades for sections they do not advise', async () => {
      const token = generateToken({ userId: teacher1Id });
      const res = await request(app)
        .get(`/api/teacher/get/specific-student-grades?studentId=${student2Id}&sectionId=${section2Id}&schoolYear=${schoolYear}`)
        .set('Cookie', `jwt=${token}`);
      
      const result = {
        'Test Case': 'Teacher accessing student grades for non-advised section',
        'User': 'Teacher 1',
        'Resource': 'Student 2 grades',
        'Status Code': res.statusCode,
        'Access': res.statusCode === 200 ? 'Allowed' : 'Denied',
        'Response': res.body?.message || JSON.stringify(res.body).substring(0, 50) + '...'
      };
      testResults.push(result);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('not an adviser');
    });

    test('Teacher cannot update grades for classes they do not teach', async () => {
      const token = generateToken({ userId: teacher1Id });
      const res = await request(app)
        .post('/api/teacher/update/student-grades')
        .set('Cookie', `jwt=${token}`)
        .send({
          selectedClass: class2Id,
          editedGrades: {
            [student2Id]: { Q1: "85" }
          },
          schoolYear
        });
      
      const result = {
        'Test Case': 'Teacher updating grades for classes they don\'t teach',
        'User': 'Teacher 1',
        'Resource': 'Class 2 grades',
        'Status Code': res.statusCode,
        'Access': res.statusCode === 200 ? 'Allowed' : 'Denied',
        'Response': res.body?.message || JSON.stringify(res.body).substring(0, 50) + '...'
      };
      testResults.push(result);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('not authorized');
    });
    
    test('Teacher can access section grades for sections they advise', async () => {
      const token = generateToken({ userId: teacher1Id });
      const res = await request(app)
        .get(`/api/teacher/get/section-grades?sectionId=${section1Id}&schoolYear=${schoolYear}`)
        .set('Cookie', `jwt=${token}`);
      
      const result = {
        'Test Case': 'Teacher accessing section grades for advised section',
        'User': 'Teacher 1',
        'Resource': 'Section 1 grades',
        'Status Code': res.statusCode,
        'Access': res.statusCode === 200 ? 'Allowed' : 'Denied',
        'Response': res.body?.message || JSON.stringify(res.body).substring(0, 50) + '...'
      };
      testResults.push(result);
      
      expect(res.statusCode).toBe(200);
    });
    
    test('Teacher cannot access section grades for sections they do not advise', async () => {
      const token = generateToken({ userId: teacher1Id });
      const res = await request(app)
        .get(`/api/teacher/get/section-grades?sectionId=${section2Id}&schoolYear=${schoolYear}`)
        .set('Cookie', `jwt=${token}`);
      
      const result = {
        'Test Case': 'Teacher accessing section grades for non-advised section',
        'User': 'Teacher 1',
        'Resource': 'Section 2 grades',
        'Status Code': res.statusCode,
        'Access': res.statusCode === 200 ? 'Allowed' : 'Denied',
        'Response': res.body?.message || JSON.stringify(res.body).substring(0, 50) + '...'
      };
      testResults.push(result);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('not an adviser');
    });
  });

  // After all tests, display the results in a table
  afterAll(() => {
    console.log('\n🔒 Resource-Specific Access Control Test Results:');
    console.table(testResults);
  });
});