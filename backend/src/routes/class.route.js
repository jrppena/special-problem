import express from 'express';
import { classRoutes } from "../controllers/class-controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get('/get/:schoolYear', protectRoute, classRoutes.fetchClasses);
router.post('/create', protectRoute, classRoutes.createClass);
router.put('/edit/:id', protectRoute, classRoutes.editClass);
router.delete('/delete/:id', protectRoute, classRoutes.deleteClass);
router.post('/create/import', protectRoute, classRoutes.createClassThroughImport);
router.delete('/delete/all/:schoolYear', protectRoute, classRoutes.deleteAllClassesGivenSchoolYear);
export default router;