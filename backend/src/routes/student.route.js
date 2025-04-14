import express from 'express';
import { studentRoutes } from "../controllers/student-controller.js";
import { protectRoute, studentSpecificRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.get('/enrolled-classes', protectRoute, studentSpecificRoute, studentRoutes.getEnrolledClasses);
router.get('/enrolled-classes-grades', protectRoute, studentSpecificRoute, studentRoutes.getEnrolledClassesGrades);
router.get('/chart-data', protectRoute, studentSpecificRoute, studentRoutes.generateChartData);
export default router;