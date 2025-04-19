// validators/message.validator.js
import { param, body } from 'express-validator';

export const messageValidators = {
  getUsersForSidebar: [],
  
  getMessages: [
    param('id').isMongoId().withMessage('Valid conversation ID is required')
  ],
  
  sendMessage: [
    param('id')
      .isMongoId()
      .withMessage('Valid recipient ID is required'),
  
    // Require either non-empty text or non-null image
    body()
      .custom(body => {
        if (!body.text && body.image == null) {
          throw new Error('Message must contain either text or image');
        }
        return true;
      }),
  
    // Validate text if provided
    body('text')
      .optional()
      .isString()
      .trim(),
  
    // Allow image to be null, or a valid string
    body('image')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null) return true;
        if (typeof value !== 'string') {
          throw new Error('Invalid image format');
        }
        return true;
      })
  ]
  
};