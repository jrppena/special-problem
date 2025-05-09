// validators/teacher.validator.js
import { body, query } from 'express-validator';

export const teacherValidators = {
  getTeachers: [],
  
  getAvailableStudents: [
    query('gradeLevel').isInt({ min: 7, max: 10 }).withMessage('Valid grade level (7-10) is required'),
    query('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY')
  ],
  
  addStudentToSection: [
    body('data.sectionId').isMongoId().withMessage('Valid section ID is required'),
    body('data.studentIds').isArray().withMessage('Student IDs must be an array'),
    body('data.studentIds.*').isMongoId().withMessage('Valid student IDs required'),
    body('data.schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY')
  ],
  
  removeStudentFromSection: [
    body('studentId').isMongoId().withMessage('Valid student ID is required'),
    body('sectionId').isMongoId().withMessage('Valid section ID is required'),
    body('schoolYear').optional().matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY')
  ],
  
  getAssignedClasses: [
    query('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY')
  ],
  
  updateStudentGrades: [
    body('selectedClass._id').isMongoId().withMessage('Valid class ID is required'),
    body('editedGrades').isObject().withMessage('Edited grades must be an object'),
    body('schoolYear').optional().matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY')
  ],
  
  getClassGrades: [
    query('classId').isMongoId().withMessage('Valid class ID is required'),
    query('gradingPeriod').isIn(['Q1', 'Q2', 'Q3', 'Q4', 'all']).withMessage('Valid grading period is required'),
    query('sectionId').isMongoId().withMessage('Valid section ID is required'),
    query('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY')
  ],
  
  getChartData: [
    query('classId').isMongoId().withMessage('Valid class ID is required'),
    query('gradingPeriod').isIn(['Q1', 'Q2', 'Q3', 'Q4', 'all']).withMessage('Valid grading period is required'),
    query('dataType').isIn(['singleSectionPerformance', 'sectionsPerformance']).withMessage('Valid data type is required'),
    query('sectionId').optional().isMongoId().withMessage('Valid section ID is required'),
    query('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY'),
    query('studentIds').optional().custom((value) => {
      try {
        if (typeof value === 'string') {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        }
        return Array.isArray(value);
      } catch (e) {
        return false;
      }
    }).withMessage('Student IDs must be a valid JSON array')
  ],
  
  getSpecificStudentGrades: [
    query('studentId').isMongoId().withMessage('Valid student ID is required'),
    query('sectionId').isMongoId().withMessage('Valid section ID is required'),
    query('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY')
  ],
  
  getSectionGrades: [
    query('sectionId').isMongoId().withMessage('Valid section ID is required'),
    query('schoolYear').matches(/^\d{4}-\d{4}$/).withMessage('School year format should be YYYY-YYYY')
  ]
};