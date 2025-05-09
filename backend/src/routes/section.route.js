import express from 'express';
import { sectionRoutes } from "../controllers/section-controller.js";
import { protectRoute} from "../middlewares/auth.middleware.js";
import { adminSpecificRoute, teacherSpecificRoute } from "../middlewares/rbac.middleware.js";
import { sectionValidators } from "../validators/section.validator.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.get('/get/:schoolYear', protectRoute, adminSpecificRoute, sectionValidators.getAllSectionsGivenSchoolYear, validate, sectionRoutes.getAllSectionsGivenSchoolYear);
router.get('/get/available-advisers/:schoolYear', protectRoute, adminSpecificRoute, sectionValidators.getAvailableAdvisers, validate, sectionRoutes.getAvailableAdvisers);
router.post('/add', protectRoute, adminSpecificRoute, sectionValidators.createSection, validate, sectionRoutes.createSection);
router.put('/edit/:id', protectRoute, adminSpecificRoute, sectionValidators.editSelectedSection, validate, sectionRoutes.editSelectedSection);
router.delete('/delete/:id', protectRoute, adminSpecificRoute, sectionValidators.deleteSelectedSection, validate, sectionRoutes.deleteSelectedSection);
router.get('/get/adviser-sections/:id/:schoolYear', protectRoute, teacherSpecificRoute, sectionValidators.getAdviserSections, validate, sectionRoutes.getAdviserSections);

export default router;