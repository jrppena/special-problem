import express from 'express';
import { classRoutes } from "../controllers/class-controller.js";
import { protectRoute,adminSpecificRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get('/get/:schoolYear', protectRoute, adminSpecificRoute, classRoutes.fetchClasses);
router.post('/create', protectRoute, adminSpecificRoute, classRoutes.createClass);
router.put('/edit/:id', protectRoute, adminSpecificRoute, classRoutes.editClass);
router.delete('/delete/:id', protectRoute, adminSpecificRoute, classRoutes.deleteClass);
router.post('/create/import', protectRoute, adminSpecificRoute, classRoutes.createClassThroughImport);
router.delete('/delete/all/:schoolYear', protectRoute, adminSpecificRoute, classRoutes.deleteAllClassesGivenSchoolYear);
export default router;