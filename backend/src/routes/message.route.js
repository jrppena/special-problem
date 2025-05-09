import express from 'express';
import { protectRoute } from "../middlewares/auth.middleware.js";
import { messageRoutes } from "../controllers/message-controller.js";
import { messageValidators } from "../validators/message.validator.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.get("/users", protectRoute, messageValidators.getUsersForSidebar, validate, messageRoutes.getUsersForSidebar);
router.get("/:id", protectRoute, messageValidators.getMessages, validate, messageRoutes.getMessages);
router.post("/send/:id", protectRoute, messageValidators.sendMessage, validate, messageRoutes.sendMessage);
router.get("/unread/all", protectRoute, messageRoutes.getUnreadMessages);
router.patch("/read/:senderId", protectRoute, messageRoutes.markMessagesAsRead);

export default router;