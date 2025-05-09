import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import User from '../models/user.model.js';
import connectDB from '../config/mongodb.js';
import authRouter from '../routes/auth.route.js';

// Load environment variables
dotenv.config();

// Create a test Express app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);

// Increase Jest timeout
jest.setTimeout(30000);

describe('Password Hashing in Signup', () => {
  const testUser = {
    first_name: 'Password',
    last_name: 'Test',
    email: `password.test.${Date.now()}@example.com`,
    password: 'plainTextPassword123',
    role: 'Student',
    gradeLevel: 'Grade 9'
  };
  
  let createdUserId;
  
  // Connect to database before tests
  beforeAll(async () => {
    try {
      await connectDB();
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  });
  
  // Clean up after all tests
  afterAll(async () => {
    // Clean up the test user if created
    if (createdUserId) {
      try {
        await User.findByIdAndDelete(createdUserId);
      } catch (error) {
        console.error('Error deleting test user:', error);
      }
    }
    
    // Close database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
  
  test('Password is properly hashed during signup', async () => {
    // 1. Register a new user
    const signupResponse = await request(app)
      .post('/api/auth/signup')
      .send(testUser);
    
    // 2. Expect successful registration
    expect(signupResponse.statusCode).toBe(201);
    expect(signupResponse.body.message).toContain('User created successfully');
    
    // 3. Find the user in the database by email
    const userInDb = await User.findOne({ email: testUser.email });
    
    // 4. Store user ID for cleanup
    createdUserId = userInDb._id;
    
    // 5. Verify user exists in database
    expect(userInDb).toBeTruthy();
    
    // 6. Verify the password in database is not the plain text password
    expect(userInDb.password).not.toBe(testUser.password);
    
    // 7. Check if the stored password is hashed by confirming it's longer than the original
    expect(userInDb.password.length).toBeGreaterThan(testUser.password.length);
    
    // 8. Verify the password can be verified using bcrypt compare
    const passwordMatches = await bcrypt.compare(testUser.password, userInDb.password);
    expect(passwordMatches).toBe(true);
    
    // 9. Verify a different password fails the comparison
    const wrongPasswordMatches = await bcrypt.compare('wrongPassword', userInDb.password);
    expect(wrongPasswordMatches).toBe(false);
    
    // 10. Log details in table format
    console.log('\n🔐 Password Hashing Test Results:');
    console.table([
      {
        'Test': 'Original vs Hashed',
        'Original Password': testUser.password,
        'Hashed Password': userInDb.password,
        'Password Length': testUser.password.length,
        'Hash Length': userInDb.password.length,
        'Correct Password Match': passwordMatches,
        'Wrong Password Match': wrongPasswordMatches
      }
    ]);
  });
  
  test('Password with same value hashes differently', async () => {
    // Create another user with the same password
    const secondTestUser = {
      first_name: 'Second',
      last_name: 'Test',
      email: `second.test.${Date.now()}@example.com`,
      password: testUser.password, // Same password as first user
      role: 'Student',
      gradeLevel: 'Grade 10'
    };
    
    // Register second user
    const secondSignupResponse = await request(app)
      .post('/api/auth/signup')
      .send(secondTestUser);
    
    // Verify successful registration
    expect(secondSignupResponse.statusCode).toBe(201);
    
    // Find both users in database
    const firstUser = await User.findOne({ email: testUser.email });
    const secondUser = await User.findOne({ email: secondTestUser.email });
    
    // Store second user ID for cleanup
    try {
      await User.findByIdAndDelete(secondUser._id);
    } catch (error) {
      console.error('Error deleting second test user:', error);
    }
    
    // Verify both users exist
    expect(firstUser).toBeTruthy();
    expect(secondUser).toBeTruthy();
    
    // Verify that same passwords hash to different values (due to salt)
    expect(firstUser.password).not.toBe(secondUser.password);
    
    // However, both should validate against the original password
    const firstPasswordMatches = await bcrypt.compare(testUser.password, firstUser.password);
    const secondPasswordMatches = await bcrypt.compare(testUser.password, secondUser.password);
    
    expect(firstPasswordMatches).toBe(true);
    expect(secondPasswordMatches).toBe(true);
    
    // Log the salt comparison in table format
    console.log('\n🧂 Different Salt Test Results:');
    console.table([
      {
        'User': 'First User',
        'Original Password': testUser.password,
        'Hashed Password': firstUser.password,
        'Validates Correctly': firstPasswordMatches
      },
      {
        'User': 'Second User',
        'Original Password': testUser.password,
        'Hashed Password': secondUser.password,
        'Validates Correctly': secondPasswordMatches
      }
    ]);
    
    // Log hash comparison summary
    console.log('\n📊 Hash Comparison Summary:');
    console.table([
      {
        'Test': 'Same Password, Different Users',
        'Original Password': testUser.password,
        'Hashes Match Each Other': firstUser.password === secondUser.password,
        'Both Validate Against Original': firstPasswordMatches && secondPasswordMatches,
        'Hash #1 Length': firstUser.password.length,
        'Hash #2 Length': secondUser.password.length
      }
    ]);
  });
});