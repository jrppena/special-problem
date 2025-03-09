import express from 'express';
import { studentRoutes } from "../controllers/student-controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

// router.get('/get/available-students', protectRoute, studentRoutes.getAvailableStudents);
// router.post('/add/student-to-section', protectRoute, studentRoutes.addStudentToSection);

export default router;