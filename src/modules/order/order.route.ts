import { Router } from "express";
import { authenticate } from "../../core/middlewares/auth.middleware.js";
import { createOrder, getMyOrders, getOrderDetail } from "./order.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderDetail);

export default router;