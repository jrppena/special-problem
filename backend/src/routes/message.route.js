import express from 'express';
import { protectRoute } from "../middlewares/auth.middleware.js";
import {messageRoutes} from "../controllers/message-controller.js";

const router = express.Router();

router.get("/users", protectRoute, messageRoutes.getUsersForSidebar);
router.get("/:id", protectRoute, messageRoutes.getMessages);

router.post("/send/:id",protectRoute, messageRoutes.sendMessage);


export default router;