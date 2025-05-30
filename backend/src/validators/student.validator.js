// validators/student.validator.js
import { query } from 'express-validator';

export const studentValidators = {
  getEnrolledClasses: [
    query('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY')
  ],
  
  getEnrolledClassesGrades: [
    query('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY'),
    query('classes').custom((value) => {
      try {
        if (typeof value === 'string') {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        }
        return Array.isArray(value);
      } catch (e) {
        return false;
      }
    }).withMessage('Classes must be a valid JSON array')
  ],
  
  generateChartData: [
    query('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY'),
    query('dataType').isIn(['singleSubjectAcrossQuarters', 'subjectsAcrossQuarters', 'subjectsInOneQuarter'])
      .withMessage('Invalid data type'),
    query('selectedSubject').optional().isMongoId().withMessage('Valid subject ID is required'),
    // Add a custom validator to check selectedQuarter conditional on dataType
    query('selectedQuarter').custom((value, { req }) => {
      if (req.query.dataType === 'subjectsInOneQuarter' && !value) {
        throw new Error('Quarter is required when dataType is subjectsInOneQuarter');
      }
      if (value && !['Q1', 'Q2', 'Q3', 'Q4'].includes(value)) {
        throw new Error('Valid quarter is required');
      }
      return true;
    })
  ]
};