import express from 'express';
import { teacherRoutes } from "../controllers/teacher-controller.js";
import { protectRoute, teacherSpecificRoute, teacherOrAdminSpecificRoute, adminSpecificRoute} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get('/get', protectRoute, adminSpecificRoute, teacherRoutes.getTeachers);
router.get('/get/available-students', protectRoute, teacherSpecificRoute, teacherRoutes.getAvailableStudents);
router.post('/add/student-to-section', protectRoute, teacherSpecificRoute, teacherRoutes.addStudentToSection);
router.delete('/remove/student-from-section', protectRoute, teacherSpecificRoute, teacherRoutes.removeStudentFromSection);
router.get('/get/assigned-classes', protectRoute, teacherSpecificRoute, teacherRoutes.getAssignedClasses);
router.post('/update/student-grades', protectRoute, teacherOrAdminSpecificRoute, teacherRoutes.updateStudentGrades);
router.get('/get/class-grades', protectRoute, teacherOrAdminSpecificRoute, teacherRoutes.getClassGrades);
router.get('/get/chart-data', protectRoute, teacherSpecificRoute, teacherRoutes.getChartData);
router.get('/get/specific-student-grades',protectRoute, teacherSpecificRoute, teacherRoutes.getSpecificStudentGrades)
router.get('/get/section-grades', protectRoute, teacherSpecificRoute, teacherRoutes.getSectionGrades);

export default router;
