// validators/class.validator.js
import { body, param, query } from 'express-validator';

export const classValidators = {
  fetchClasses: [
    param('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY')
  ],
  
  createClass: [
    body('subjectName').trim().isLength({ min: 3 }).withMessage('Subject name is required'),
    body('gradeLevel').isInt({ min: 7, max: 10 }).withMessage('Valid grade level (7-10) is required'),
    body('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY'),
    body('teachers').isArray().withMessage('Teachers must be an array'),
    body('teachers.*').isMongoId().withMessage('Valid teacher IDs required'),
    body('sections').isArray().withMessage('Sections must be an array'),
    body('sections.*').isMongoId().withMessage('Valid section IDs required')
  ],
  
  editClass: [
    param('id').isMongoId().withMessage('Valid class ID is required'),
    body('subjectName').trim().isLength({ min: 3 }).withMessage('Subject name is required'),
    body('gradeLevel').isInt({ min: 7, max: 10 }).withMessage('Valid grade level (7-10) is required'),
    body('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY'),
    body('teachers').isArray().withMessage('Teachers must be an array'),
    body('teachers.*').isMongoId().withMessage('Valid teacher IDs required'),
    body('sections').isArray().withMessage('Sections must be an array'),
    body('sections.*').isMongoId().withMessage('Valid section IDs required')
  ],
  
  deleteClass: [
    param('id').isMongoId().withMessage('Valid class ID is required')
  ],
  
  createClassThroughImport: [
    body().isArray().withMessage('Import data must be an array'),
    body('*.subjectName').trim().isLength({ min: 3 }).withMessage('Subject name is required'),
    body('*.gradeLevel').isInt({ min: 7, max: 10 }).withMessage('Valid grade level (7-10) is required'),
    body('*.schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY'),
    body('*.teachers').isArray().withMessage('Teachers must be an array'),
    body('*.teachers.*').isMongoId().withMessage('Valid teacher IDs required'),
    body('*.sections').isArray().withMessage('Sections must be an array'),
    body('*.sections.*').isMongoId().withMessage('Valid section IDs required')
  ],
  
  deleteAllClassesGivenSchoolYear: [
    param('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY')
  ]
};