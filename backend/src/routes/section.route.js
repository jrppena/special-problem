import express from 'express';
import { sectionRoutes } from "../controllers/section-controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get('/get/:schoolYear', protectRoute, sectionRoutes.getAllSectionsGivenSchoolYear);
router.get('/get/available-advisers/:schoolYear', protectRoute, sectionRoutes.getAvailableAdvisers);
router.post('/add', protectRoute, sectionRoutes.createSection);
router.put('/edit/:id', protectRoute, sectionRoutes.editSelectedSection);

export default router;