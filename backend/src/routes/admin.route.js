import express from "express";
import { adminRoutes } from "../controllers/admin-controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { adminSpecificRoute } from "../middlewares/rbac.middleware.js";

const router = express.Router();

router.get("/pending-users", protectRoute, adminSpecificRoute, adminRoutes.getPendingUsers);
router.post("/verify/:userId", protectRoute, adminSpecificRoute, adminRoutes.verifyUser);

export default router;