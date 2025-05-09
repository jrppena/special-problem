import express from 'express';
import { authRoutes } from "../controllers/auth-controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { authValidators } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.post('/signup', authValidators.signup, validate, authRoutes.signup);
router.post('/login', authValidators.login, validate, authRoutes.login);
router.get('/logout', protectRoute, authRoutes.logout);
router.get('/check', protectRoute, authRoutes.checkAuth);
router.put('/update', protectRoute, authValidators.updateProfile, validate, authRoutes.updateProfile);

export default router;