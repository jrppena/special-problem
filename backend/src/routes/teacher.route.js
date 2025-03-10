import express from 'express';
import { teacherRoutes } from "../controllers/teacher-controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get('/get', protectRoute, teacherRoutes.getTeachers);
router.get('/check/if-adviser/:id', protectRoute, teacherRoutes.checkIfAdviser);
router.get('/get/available-students', protectRoute, teacherRoutes.getAvailableStudents);
router.post('/add/student-to-section', protectRoute, teacherRoutes.addStudentToSection);
router.delete('/remove/student-from-section', protectRoute, teacherRoutes.removeStudentFromSection);
router.get('/get/assigned-classes', protectRoute, teacherRoutes.getAssignedClasses);
router.post('/update/student-grades', protectRoute, teacherRoutes.updateStudentGrades);
router.get('/get/class-grades', protectRoute, teacherRoutes.getClassGrades);

export default router;