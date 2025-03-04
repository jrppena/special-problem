import express from 'express';
import { teacherRoutes } from "../controllers/teacher-controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get('/get', protectRoute, teacherRoutes.getTeachers);

export default router;