// validators/admin.validator.js
import { param, query, body } from 'express-validator';

export const adminValidators = {
  getPendingUsers: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('showAll').optional().isBoolean().withMessage('showAll must be a boolean'),
    query('role').optional().isIn(['Student', 'Teacher']).withMessage('Role must be Student or Teacher')
  ],
  
  verifyUser: [
    param('userId').isMongoId().withMessage('Valid user ID is required'),
    body('isVerified').isBoolean().withMessage('isVerified must be a boolean')
  ]
};