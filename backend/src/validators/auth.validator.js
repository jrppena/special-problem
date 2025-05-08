// validators/auth.validator.js
import { body } from 'express-validator';

export const authValidators = {
  signup: [
    body('first_name').trim().isLength({ min: 2 }).withMessage('First name is required'),
    body('last_name').trim().isLength({ min: 2 }).withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['Student', 'Teacher', 'Admin']).withMessage('Valid role is required'),
    body('gradeLevel')
      .if(body('role').equals('Student'))
      .isInt({ min: 7, max: 10 })
      .withMessage('Valid grade level (7-10) is required for students')
  ],
  
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  
  updateProfile: [
    body('contact_number').optional().trim(),
    body('address').optional().trim(),
    body('didChangeImage').optional().isBoolean().withMessage('didChangeImage must be a boolean'),
    body('selectedImage').optional().isString().withMessage('Invalid image format')
  ]
};