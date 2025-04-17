// validators/message.validator.js
import { param, body } from 'express-validator';

export const messageValidators = {
  getUsersForSidebar: [],
  
  getMessages: [
    param('id').isMongoId().withMessage('Valid conversation ID is required')
  ],
  
  sendMessage: [
    param('id').isMongoId().withMessage('Valid recipient ID is required'),
    body()
      .custom((body) => {
        // Either text or image is required
        return body.text || body.image;
      })
      .withMessage('Message must contain either text or image'),
    body('text').optional().trim(),
    body('image').optional().isString().withMessage('Invalid image format')
  ]
};