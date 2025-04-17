import express from 'express';
import { classRoutes } from "../controllers/class-controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { adminSpecificRoute } from "../middlewares/rbac.middleware.js";
import { classValidators } from "../validators/class.validator.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.get('/get/:schoolYear', protectRoute, adminSpecificRoute, classValidators.fetchClasses, validate, classRoutes.fetchClasses);
router.post('/create', protectRoute, adminSpecificRoute, classValidators.createClass, validate, classRoutes.createClass);
router.put('/edit/:id', protectRoute, adminSpecificRoute, classValidators.editClass, validate, classRoutes.editClass);
router.delete('/delete/:id', protectRoute, adminSpecificRoute, classValidators.deleteClass, validate, classRoutes.deleteClass);
router.post('/create/import', protectRoute, adminSpecificRoute, classValidators.createClassThroughImport, validate, classRoutes.createClassThroughImport);
router.delete('/delete/all/:schoolYear', protectRoute, adminSpecificRoute, classValidators.deleteAllClassesGivenSchoolYear, validate, classRoutes.deleteAllClassesGivenSchoolYear);

export default router;