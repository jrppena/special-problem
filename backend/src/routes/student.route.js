import express from 'express';
import { studentRoutes } from "../controllers/student-controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { studentSpecificRoute } from "../middlewares/rbac.middleware.js";
import { studentValidators } from "../validators/student.validator.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.get('/enrolled-classes', protectRoute, studentSpecificRoute, studentValidators.getEnrolledClasses, validate, studentRoutes.getEnrolledClasses);
router.get('/enrolled-classes-grades', protectRoute, studentSpecificRoute, studentValidators.getEnrolledClassesGrades, validate, studentRoutes.getEnrolledClassesGrades);
router.get('/chart-data', protectRoute, studentSpecificRoute, studentValidators.generateChartData, validate, studentRoutes.generateChartData);

export default router;