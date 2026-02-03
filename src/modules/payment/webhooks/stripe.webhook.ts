import { Request, Response } from "express";
import Stripe from "stripe";
import { env } from "../../../core/config/env.js";
import { paymentService } from "../payment.service.js";
import { logger } from "../../../core/logger/logger.js";


const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
    apiVersion: env.STRIPE_API_VERSION as any || "2024-04-10",
});

export const stripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig as string,
            env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        logger.error(`Stripe Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const orderId = session.client_reference_id || session.metadata?.orderId;
        const transactionId = session.payment_intent as string;

        if (orderId) {
            try {
                await paymentService.confirmPaymentSuccess(orderId, transactionId);
                logger.info(`Stripe Payment Success: Order ${orderId}`);
            } catch (error) {
                logger.error(`Stripe Update Order Failed: ${error}`);
            }
        }
    }

    res.json({ received: true });
};