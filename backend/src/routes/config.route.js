import express from 'express';
import {configRoutes} from '../controllers/config-controller.js';
import { protectRoute } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.get('/get/school-years', protectRoute, configRoutes.getAllSchoolYears);
router.get('/get/current-school-year', protectRoute, configRoutes.getCurrentSchoolYear);
router.put('/update/current-school-year', protectRoute, configRoutes.updateCurrentSchoolYear);

export default router;

