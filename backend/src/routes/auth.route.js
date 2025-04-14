import express from 'express';
import { authRoutes } from "../controllers/auth-controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/signup', authRoutes.signup);
router.post('/login', authRoutes.login);
router.get('/logout', protectRoute, authRoutes.logout);
router.get('/check', protectRoute, authRoutes.checkAuth);
router.put('/update', protectRoute, authRoutes.updateProfile);


export default router;