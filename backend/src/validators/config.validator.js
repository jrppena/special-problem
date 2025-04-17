// validators/config.validator.js
import { body } from 'express-validator';

export const configValidators = {
  getAllSchoolYears: [],
  
  getCurrentSchoolYear: [],
  
  updateCurrentSchoolYear: [
    body('currentSchoolYear')
      .optional()
      .matches(/^\d{4}-\d{4}$/)
      .withMessage('School year format should be YYYY-YYYY')
  ]
};