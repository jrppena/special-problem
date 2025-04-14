import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { protectRoute } from '../middlewares/auth.middleware.js';
import User from '../models/user.model.js';
import { adminRoutes } from '../controllers/admin-controller.js';
import { authRoutes } from '../controllers/auth-controller.js'; // Import authRoutes for testing
import connectDB from '../config/mongodb.js';

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
  const authRouter = express.Router();

  // Add the protected routes with middleware
  adminRouter.get('/pending-users', protectRoute, adminRoutes.getPendingUsers);
  
  // Add auth routes for testing account status restrictions
  authRouter.get('/check', protectRoute, authRoutes.checkAuth);
  authRouter.get('/logout', protectRoute, authRoutes.logout);
  authRouter.put('/update', protectRoute, authRoutes.updateProfile);

  // Mount the routers
  app.use('/api/admin', adminRouter);
  app.use('/api/auth', authRouter);

  return app;
};

// Increase Jest timeout for all tests
jest.setTimeout(30000);

let validUserId;
let pendingUserId;
let rejectedUserId;
const fakeUserId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but doesn't exist
const secret = process.env.JWT_SECRET || 'testsecret';

// Set up database connection before tests
beforeAll(async () => {
  try {
    // Connect to database
    await connectDB();

    // Find a verified student account for testing or create one
    const user = await User.findOne({ role: 'Student' }).select('_id');
    if (!user) {
      // Create a mock user for testing
      const newUser = new User({
        firstName: 'Test',
        lastName: 'Student',
        email: 'test.student@example.com',
        password: 'hashedpassword',
        role: 'Student',
        accountStatus: 'Verified'
      });
      await newUser.save();
      validUserId = newUser._id.toString();
    } else {
      validUserId = user._id.toString();
      // Ensure user has Verified status
      await User.findByIdAndUpdate(validUserId, { accountStatus: 'Verified' });
    }

    // Create or find a user with Pending status
    const pendingUser = await User.findOne({ accountStatus: 'Pending' });
    if (!pendingUser) {
      const newPendingUser = new User({
        firstName: 'Pending',
        lastName: 'User',
        email: 'pending.user@example.com',
        password: 'hashedpassword',
        role: 'Student',
        accountStatus: 'Pending'
      });
      await newPendingUser.save();
      pendingUserId = newPendingUser._id.toString();
    } else {
      pendingUserId = pendingUser._id.toString();
    }

    // Create or find a user with Rejected status
    const rejectedUser = await User.findOne({ accountStatus: 'Rejected' });
    if (!rejectedUser) {
      const newRejectedUser = new User({
        firstName: 'Rejected',
        lastName: 'User',
        email: 'rejected.user@example.com',
        password: 'hashedpassword',
        role: 'Student',
        accountStatus: 'Rejected'
      });
      await newRejectedUser.save();
      rejectedUserId = newRejectedUser._id.toString();
    } else {
      rejectedUserId = rejectedUser._id.toString();
    }

    console.log('Setup validUserId:', validUserId);
    console.log('Setup pendingUserId:', pendingUserId);
    console.log('Setup rejectedUserId:', rejectedUserId);
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

// Main test suite
describe('Unauthorized Access Tests for Protected Route', () => {
  // Create test app for each test suite
  const app = createTestApp();
  
  // Choose one representative protected route
  const protectedRoute = '/api/admin/pending-users';

  // Define test cases
  const testCases = [
    { 
      description: 'No cookie', 
      setup: () => request(app).get(protectedRoute) 
    },
    { 
      description: 'Empty JWT cookie', 
      setup: () => request(app).get(protectedRoute).set('Cookie', 'jwt=') 
    },
    { 
      description: 'Expired token', 
      setup: () => {
        const expired = generateToken({ userId: validUserId }, { expiresIn: '-10s' });
        return request(app).get(protectedRoute).set('Cookie', `jwt=${expired}`);
      }
    },
    { 
      description: 'Malformed token', 
      setup: () => request(app).get(protectedRoute).set('Cookie', 'jwt=abc.def.ghi') 
    },
    { 
      description: 'Tampered token', 
      setup: () => {
        const token = generateToken({ userId: validUserId });
        const tampered = token.split('.').slice(0, 2).join('.') + '.invalidsig';
        return request(app).get(protectedRoute).set('Cookie', `jwt=${tampered}`);
      }
    },
    { 
      description: 'Token with fake user ID', 
      setup: () => {
        const token = generateToken({ userId: fakeUserId });
        return request(app).get(protectedRoute).set('Cookie', `jwt=${token}`);
      }
    },
    { 
      description: 'Wrong cookie name', 
      setup: () => {
        const token = generateToken({ userId: validUserId });
        return request(app).get(protectedRoute).set('Cookie', `notjwt=${token}`);
      }
    }
  ];

  // Create an array to store test results
  const testResults = [];

  // Run all test cases in a flat structure
  testCases.forEach((testCase, index) => {
    test(`${index + 1}. ${testCase.description}`, async () => {
      // Debug: Log the route and current test case details

      const res = await testCase.setup();
      
      // Store result in testResults
      testResults.push({
        'Test Case': testCase.description,
        'Status Code': res.statusCode,
        'Response Message': res.body?.message || res.text || 'No message'
      });

      // We expect auth errors or not found
      expect([401, 403, 404]).toContain(res.statusCode);
    });
  });

  // After all tests, display the results in a table
  afterAll(() => {
    console.log('\n🔐 Unauthorized Access Test Results:');
    console.table(testResults);
  });
});

// New test suite specifically for account status restrictions
describe('Account Status Restriction Tests', () => {
  // Create test app
  const app = createTestApp();
  
  // Define routes for testing
  const restrictedRoute = '/api/auth/update'; // Should be restricted for non-verified users
  const allowedRoutes = ['/api/auth/check', '/api/auth/logout']; // Should be accessible for all authenticated users
  
  // Create an array to store test results
  const statusTestResults = [];

  // Test that pending users can access allowed routes
  allowedRoutes.forEach((route, index) => {
    test(`Pending user can access ${route}`, async () => {
      const token = generateToken({ userId: pendingUserId });
      const res = await request(app).get(route).set('Cookie', `jwt=${token}`);
      
      // Store result
      statusTestResults.push({
        'Test Case': `Pending user accessing ${route}`,
        'Status Code': res.statusCode,
        'Access': res.statusCode < 400 ? 'Allowed' : 'Denied'
      });
      
      // We expect successful responses (2xx)
      expect(res.statusCode).toBeLessThan(400);
    });
  });

  // Test that rejected users can access allowed routes
  allowedRoutes.forEach((route, index) => {
    test(`Rejected user can access ${route}`, async () => {
      const token = generateToken({ userId: rejectedUserId });
      const res = await request(app).get(route).set('Cookie', `jwt=${token}`);
      
      // Store result
      statusTestResults.push({
        'Test Case': `Rejected user accessing ${route}`,
        'Status Code': res.statusCode,
        'Access': res.statusCode < 400 ? 'Allowed' : 'Denied'
      });
      
      // We expect successful responses (2xx)
      expect(res.statusCode).toBeLessThan(400);
    });
  });
  
  // Test that pending users cannot access restricted routes
  test('Pending user cannot access restricted route', async () => {
    const token = generateToken({ userId: pendingUserId });
    const res = await request(app).put(restrictedRoute).set('Cookie', `jwt=${token}`);
    
    // Store result
    statusTestResults.push({
      'Test Case': 'Pending user accessing restricted route',
      'Status Code': res.statusCode,
      'Access': res.statusCode < 400 ? 'Allowed' : 'Denied',
      'Response Message': res.body?.message || 'No message'
    });
    
    // We expect 403 Forbidden
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toContain('account must be verified');
  });
  
  // Test that rejected users cannot access restricted routes
  test('Rejected user cannot access restricted route', async () => {
    const token = generateToken({ userId: rejectedUserId });
    const res = await request(app).put(restrictedRoute).set('Cookie', `jwt=${token}`);
    
    // Store result
    statusTestResults.push({
      'Test Case': 'Rejected user accessing restricted route',
      'Status Code': res.statusCode,
      'Access': res.statusCode < 400 ? 'Allowed' : 'Denied',
      'Response Message': res.body?.message || 'No message'
    });
    
    // We expect 403 Forbidden
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toContain('account must be verified');
  });
  
  // Test that verified users can access all routes
  test('Verified user can access restricted route', async () => {
    const token = generateToken({ userId: validUserId });
    const res = await request(app).put(restrictedRoute).set('Cookie', `jwt=${token}`);
    
    // Store result
    statusTestResults.push({
      'Test Case': 'Verified user accessing restricted route',
      'Status Code': res.statusCode,
      'Access': res.statusCode < 400 ? 'Allowed' : 'Denied'
    });
    
    // We don't test for specific success code here as the actual implementation of updateProfile
    // might return various status codes based on input validation, etc.
    // We just want to make sure it's not being blocked by our middleware
    expect(res.statusCode).not.toBe(403);
  });

  // After all tests, display the results in a table
  afterAll(() => {
    console.log('\n🔒 Account Status Restriction Test Results:');
    console.table(statusTestResults);
  });
});