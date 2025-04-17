// validators/section.validator.js
import { body, param } from 'express-validator';

export const sectionValidators = {
  getAllSectionsGivenSchoolYear: [
    param('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY')
  ],
  
  getAvailableAdvisers: [
    param('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY')
  ],
  
  createSection: [
    body('sectionName').trim().isLength({ min: 2 }).withMessage('Section name is required'),
    body('gradeLevel').isInt({ min: 7, max: 12 }).withMessage('Valid grade level (7-12) is required'),
    body('adviserIds').isArray().withMessage('Adviser IDs must be an array'),
    body('adviserIds.*').isMongoId().withMessage('Valid adviser IDs required'),
    body('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY')
  ],
  
  editSelectedSection: [
    param('id').isMongoId().withMessage('Valid section ID is required'),
    body('sectionName').trim().isLength({ min: 2 }).withMessage('Section name is required'),
    body('gradeLevel').custom((value) => {
      if (typeof value === 'string') {
        // If it's a string like "Grade 7", extract the number
        const match = value.match(/\d+/);
        if (match && parseInt(match[0]) >= 7 && parseInt(match[0]) <= 12) {
          return true;
        }
        return false;
      } else if (typeof value === 'number') {
        // If it's a number, check the range
        return value >= 7 && value <= 12;
      }
      return false;
    }).withMessage('Valid grade level (7-12) is required'),
    body('advisers').isArray().withMessage('Advisers must be an array'),
    body('advisers.*').isMongoId().withMessage('Valid adviser IDs required')
  ],
  
  deleteSelectedSection: [
    param('id').isMongoId().withMessage('Valid section ID is required')
  ],
  
  getAdviserSections: [
    param('id').isMongoId().withMessage('Valid adviser ID is required'),
    param('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY')
  ]
};