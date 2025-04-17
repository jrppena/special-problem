import express from 'express';
import {configRoutes} from '../controllers/config-controller.js';
import { protectRoute } from "../middlewares/auth.middleware.js";
import { adminSpecificRoute } from "../middlewares/rbac.middleware.js";
import { configValidators } from "../validators/config.validator.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.get('/get/school-years', protectRoute, configValidators.getAllSchoolYears, validate, configRoutes.getAllSchoolYears);
router.get('/get/current-school-year', protectRoute, configValidators.getCurrentSchoolYear, validate, configRoutes.getCurrentSchoolYear);
router.put('/update/current-school-year', protectRoute, adminSpecificRoute, configValidators.updateCurrentSchoolYear, validate, configRoutes.updateCurrentSchoolYear);

export default router;