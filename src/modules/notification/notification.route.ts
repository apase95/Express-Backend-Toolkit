import { Router } from "express";
import { authenticate } from "../../core/middlewares/auth.middleware.js";
import { getMyNotifications, markAllAsRead, markAsRead } from "./notification.controller.js";


const router = Router();

router.use(authenticate);

router.get("/", getMyNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;