import { Router } from "express";
import { createPaymentUrl, vnpayReturn } from "./payment.controller.js";
import { authenticate } from "../../core/middlewares/auth.middleware.js";

const router = Router();

router.post("/create-url", authenticate, createPaymentUrl);
router.get("/vnpay-return", vnpayReturn);

export default router;