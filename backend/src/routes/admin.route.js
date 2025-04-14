import express from "express";
import { adminRoutes } from "../controllers/admin-controller.js";
import { protectRoute, adminSpecificRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/pending-users", protectRoute, adminSpecificRoute, adminRoutes.getPendingUsers);
router.post("/verify/:userId", protectRoute, adminSpecificRoute, adminRoutes.verifyUser);

export default router;