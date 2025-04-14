import express from 'express';
import { sectionRoutes } from "../controllers/section-controller.js";
import { protectRoute, adminSpecificRoute,teacherSpecificRoute} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get('/get/:schoolYear', protectRoute, adminSpecificRoute,sectionRoutes.getAllSectionsGivenSchoolYear);
router.get('/get/available-advisers/:schoolYear', protectRoute, adminSpecificRoute, sectionRoutes.getAvailableAdvisers);
router.post('/add', protectRoute, adminSpecificRoute, sectionRoutes.createSection);
router.put('/edit/:id', protectRoute, adminSpecificRoute, sectionRoutes.editSelectedSection);
router.delete('/delete/:id', protectRoute, adminSpecificRoute, sectionRoutes.deleteSelectedSection);
router.get('/get/adviser-sections/:id/:schoolYear', protectRoute, teacherSpecificRoute, sectionRoutes.getAdviserSections);

export default router;