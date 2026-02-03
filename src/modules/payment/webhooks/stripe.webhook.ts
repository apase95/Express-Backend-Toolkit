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

    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.client_reference_id || session.metadata?.orderId;
    const transactionId = session.payment_intent as string || session.id; 

    if (orderId) {
        try {
            switch (event.type) {
                case "checkout.session.completed":
                    await paymentService.confirmPaymentSuccess(orderId, transactionId, session);
                    logger.info(`Stripe Success: Order ${orderId}`);
                    break;

                case "checkout.session.expired":
                case "checkout.session.async_payment_failed":
                case "payment_intent.payment_failed":
                    await paymentService.handlePaymentFailed(orderId, transactionId, event.type);
                    logger.info(`Stripe Failed/Expired: Order ${orderId}`);
                    break;
        
                default:
                    break;
            }
        } catch (error) {
            logger.error(`Stripe Handler Failed: ${error}`);
        }
    }

    res.json({ received: true });
};
