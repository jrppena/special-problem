import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { authRoutes } from '../controllers/auth-controller.js';
import connectDB from '../config/mongodb.js';

// Load environment variables
dotenv.config();

// Create a test Express app
const createTestApp = (useSanitize = true) => {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(cookieParser());
  
  // Apply the mongo sanitization middleware conditionally
  if (useSanitize) {
    app.use(mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        console.log(`Sanitized request[${key}]`);
      }
    }));
  }

  // Set up test routes using your actual controllers
  const authRouter = express.Router();
  authRouter.post('/signup', authRoutes.signup);
  authRouter.post('/login', authRoutes.login);
  authRouter.get('/logout', protectRoute, authRoutes.logout);
  authRouter.put('/update', protectRoute, authRoutes.updateProfile);
  authRouter.get('/check', protectRoute, authRoutes.checkAuth);
  
  app.use('/api/auth', authRouter);

  return app;
};

// Increase Jest timeout for all tests
jest.setTimeout(30000);

let validUserId;
const secret = process.env.JWT_SECRET || 'testsecret';

// Set up database connection before tests
beforeAll(async () => {
  try {
    // Connect to database
    await connectDB();

    // Find a verified user for testing or create one
    const user = await User.findOne({ role: 'Admin' }).select('_id');
    if (!user) {
      // Create a mock admin for testing
      const newUser = new User({
        firstName: 'Test',
        lastName: 'Admin',
        email: 'test.admin@example.com',
        password: 'hashedpassword',
        role: 'Admin',
        accountStatus: 'Verified'
      });
      await newUser.save();
      validUserId = newUser._id.toString();
    } else {
      validUserId = user._id.toString();
    }

    console.log('Setup validUserId:', validUserId);
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
const generateToken = (payload, options) => 
  jwt.sign(payload, secret, options || { expiresIn: '7d' });

// Test suite for MongoDB sanitization
describe('MongoDB Sanitization Middleware Tests', () => {
  // Test cases for login route with injection attempts
  describe('Login Endpoint Protection', () => {
    // Create app with sanitization
    const sanitizedApp = createTestApp(true);
    // Create app without sanitization (for comparison)
    const vulnerableApp = createTestApp(false);
    
    const testCases = [
      {
        description: 'Normal login attempt',
        payload: { email: 'test.admin@example.com', password: 'password123' },
        expectSanitized: false
      },
      {
        description: 'NoSQL injection with $ne operator',
        payload: { email: { $ne: null }, password: { $ne: null } },
        expectSanitized: true
      },
      {
        description: 'NoSQL injection with $gt operator',
        payload: { email: 'test.admin@example.com', password: { $gt: '' } },
        expectSanitized: true
      },
      {
        description: 'NoSQL injection with $where operator',
        payload: { email: 'test.admin@example.com', $where: 'this.password.length > 0' },
        expectSanitized: true
      }
    ];
    
    const loginResults = [];
    
    // Test each case with sanitization enabled
    testCases.forEach((testCase) => {
      test(`With sanitization: ${testCase.description}`, async () => {
        // Send the request to the sanitized app
        const res = await request(sanitizedApp)
          .post('/api/auth/login')
          .send(testCase.payload);
        
        // Store results
        loginResults.push({
          'Test Case': `Sanitized - ${testCase.description}`,
          'Payload': JSON.stringify(testCase.payload),
          'Status Code': res.statusCode,
          'Response': res.body?.message || res.text || 'No message'
        });
        
        // If this was an injection attempt, we expect it to be sanitized
        if (testCase.expectSanitized) {
          expect(res.statusCode).toEqual(400);
          expect(res.body.message).toEqual('Email and password must be valid strings');
        }
      });
    });
    
    // Test vulnerable app as a comparison (only for non-destructive tests)
    testCases.forEach((testCase) => {
      // Skip this test for real vulnerable app to protect data
      if (process.env.NODE_ENV === 'production') {
        test.skip(`Without sanitization: ${testCase.description}`, () => {});
        return;
      }
      
      test(`Without sanitization: ${testCase.description}`, async () => {
        // Send the request to the vulnerable app
        const res = await request(vulnerableApp)
          .post('/api/auth/login')
          .send(testCase.payload);
        
        // Store results
        loginResults.push({
          'Test Case': `Vulnerable - ${testCase.description}`,
          'Payload': JSON.stringify(testCase.payload),
          'Status Code': res.statusCode,
          'Response': res.body?.message || res.text || 'No message'
        });
      });
    });
    
    // Display results
    afterAll(() => {
      console.log('\n🛡️ Login Protection Test Results:');
      console.table(loginResults);
    });
  });
  
  // Test updateProfile endpoint which requires authentication
  describe('Protected Route Sanitization', () => {
    // Create app with sanitization
    const sanitizedApp = createTestApp(true);
    
    const updateTestCases = [
      {
        description: 'Normal profile update',
        payload: { contact_number: '1234567890', address: '123 Main St' },
        expectSanitized: false
      },
      {
        description: 'Injection attempt in contact_number',
        payload: { contact_number: { $ne: null }, address: '123 Main St' },
        expectSanitized: true
      },
      {
        description: 'Injection attempt in address',
        payload: { contact_number: '1234567890', address: { $regex: '.*' } },
        expectSanitized: true
      }
    ];
    
    const updateResults = [];
    
    updateTestCases.forEach((testCase) => {
      test(`Protected update with sanitization: ${testCase.description}`, async () => {
        // Generate valid token
        const token = generateToken({ userId: validUserId });
        
        // Send the update request
        const res = await request(sanitizedApp)
          .put('/api/auth/update')
          .set('Cookie', `jwt=${token}`)
          .send(testCase.payload);
        
        // Store results
        updateResults.push({
          'Test Case': testCase.description,
          'Payload': JSON.stringify(testCase.payload),
          'Status Code': res.statusCode,
          'Response': res.body?.message || res.text || 'No message'
        });
        
        // If this was an injection attempt, we expect it to be sanitized
        if (testCase.expectSanitized) {
          // Check to ensure operators like $ne were removed or replaced
          const modifiedPayload = JSON.stringify(testCase.payload)
            .replace(/\$ne|\$regex|\$gt|\$where/g, '_');
          expect(res.body.message).not.toEqual('Internal server error');
        }
      });
    });
    
    // Display results
    afterAll(() => {
      console.log('\n🛡️ Protected Route Sanitization Test Results:');
      console.table(updateResults);
    });
  });
  
  // Test signup endpoint
  describe('Signup Endpoint Protection', () => {
    // Create app with sanitization
    const sanitizedApp = createTestApp(true);
    
    const signupTestCases = [
      {
        description: 'Normal signup attempt',
        payload: { 
          first_name: 'Test', 
          last_name: 'User', 
          email: `test${Math.random().toString(36).substring(7)}@example.com`, 
          password: 'password123', 
          role: 'Student' 
        },
        expectSanitized: false
      },
      {
        description: 'NoSQL injection in email field',
        payload: { 
          first_name: 'Malicious', 
          last_name: 'User', 
          email: { $ne: null }, 
          password: 'password123', 
          role: 'Student' 
        },
        expectSanitized: true
      },
      {
        description: 'NoSQL injection with $where operator',
        payload: { 
          first_name: 'Malicious', 
          last_name: 'User', 
          email: 'bad@example.com', 
          password: 'password123', 
          role: 'Student',
          $where: 'this.role === "Admin"' 
        },
        expectSanitized: true
      }
    ];
    
    const signupResults = [];
    
    signupTestCases.forEach((testCase) => {
      test(`Signup with sanitization: ${testCase.description}`, async () => {
        // Send the signup request
        const res = await request(sanitizedApp)
          .post('/api/auth/signup')
          .send(testCase.payload);
        
        // Store results
        signupResults.push({
          'Test Case': testCase.description,
          'Payload': JSON.stringify(testCase.payload).substring(0, 100), // Truncate for clarity
          'Status Code': res.statusCode,
          'Response': res.body?.message || res.text || 'No message'
        });
        
        // If this was an injection attempt, we expect it to be sanitized
        if (testCase.expectSanitized) {
          // For injection attempts, we expect either validation error or sanitization
          expect(res.statusCode).not.toEqual(201); // Should not be successful
        }
      });
    });
    
    // Display results
    afterAll(() => {
      console.log('\n🛡️ Signup Protection Test Results:');
      console.table(signupResults);
    });
  });
});