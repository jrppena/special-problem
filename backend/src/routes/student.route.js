import express from 'express';
import { studentRoutes } from "../controllers/student-controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.get('/enrolled-classes', protectRoute, studentRoutes.getEnrolledClasses);
router.get('/enrolled-classes-grades', protectRoute, studentRoutes.getEnrolledClassesGrades);


export default router;