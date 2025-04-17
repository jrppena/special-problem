import express from 'express';
import { teacherRoutes } from "../controllers/teacher-controller.js";
import { protectRoute} from "../middlewares/auth.middleware.js";
import { teacherSpecificRoute, teacherOrAdminSpecificRoute, adminSpecificRoute } from "../middlewares/rbac.middleware.js";
import { teacherValidators } from "../validators/teacher.validator.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.get('/get', protectRoute, adminSpecificRoute, teacherValidators.getTeachers, validate, teacherRoutes.getTeachers);
router.get('/get/available-students', protectRoute, teacherSpecificRoute, teacherValidators.getAvailableStudents, validate, teacherRoutes.getAvailableStudents);
router.post('/add/student-to-section', protectRoute, teacherSpecificRoute, teacherValidators.addStudentToSection, validate, teacherRoutes.addStudentToSection);
router.delete('/remove/student-from-section', protectRoute, teacherSpecificRoute, teacherValidators.removeStudentFromSection, validate, teacherRoutes.removeStudentFromSection);
router.get('/get/assigned-classes', protectRoute, teacherSpecificRoute, teacherValidators.getAssignedClasses, validate, teacherRoutes.getAssignedClasses);
router.post('/update/student-grades', protectRoute, teacherOrAdminSpecificRoute, teacherValidators.updateStudentGrades, validate, teacherRoutes.updateStudentGrades);
router.get('/get/class-grades', protectRoute, teacherOrAdminSpecificRoute, teacherValidators.getClassGrades, validate, teacherRoutes.getClassGrades);
router.get('/get/chart-data', protectRoute, teacherSpecificRoute, teacherValidators.getChartData, validate, teacherRoutes.getChartData);
router.get('/get/specific-student-grades', protectRoute, teacherSpecificRoute, teacherValidators.getSpecificStudentGrades, validate, teacherRoutes.getSpecificStudentGrades);
router.get('/get/section-grades', protectRoute, teacherSpecificRoute, teacherValidators.getSectionGrades, validate, teacherRoutes.getSectionGrades);

export default router;
