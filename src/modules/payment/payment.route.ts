import express from "express";
import { Router } from "express";
import { createPaymentUrl, vnpayReturn } from "./payment.controller.js";
import { authenticate } from "../../core/middlewares/auth.middleware.js";
import { vnpayIpn } from "./webhooks/vnpay.webhook.js";
import { stripeWebhook } from "./webhooks/stripe.webhook.js";

const router = Router();


router.post(
    "/stripe/webhook", 
    express.raw({ type: "application/json" }), 
    stripeWebhook
);

router.get("/vnpay/ipn", vnpayIpn);

router.post("/create-url", authenticate, createPaymentUrl);
router.get("/vnpay-return", vnpayReturn);


export default router;