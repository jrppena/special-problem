import express from 'express';
import { authRoutes } from "../controllers/auth-controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/signup', authRoutes.signup);
router.post('/login', authRoutes.login);
router.get('/logout', authRoutes.logout);
router.get('/check', protectRoute, authRoutes.checkAuth);

export default router;