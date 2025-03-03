import express from "express";
import { adminRoutes } from "../controllers/admin-controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/pending-users", protectRoute, adminRoutes.getPendingUsers);
router.post("/verify/:userId", protectRoute, adminRoutes.verifyUser);

export default router;