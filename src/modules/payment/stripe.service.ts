import Stripe from "stripe";
import { env } from "../../core/config/env.js";
import { CreatePaymentParams, IPaymentGateway } from "./interfaces/payment.interface.js";
import { AppError } from "../../core/errors/AppError.js";

export class StripeService implements IPaymentGateway {
    private stripe: Stripe;

    constructor() {
        if (!env.STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY is not defined");
        }
        this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            apiVersion: "2026-01-28.clover",
        });
    }

    async createPaymentUrl(params: CreatePaymentParams): Promise<string> {
        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "vnd",
                            product_data: {
                                name: `Order #${params.orderId}`,
                                description: params.orderDescription,
                            },
                            unit_amount: params.amount,
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url: `${env.CLIENT_URL}/payment/success?orderId=${params.orderId}`,
                cancel_url: `${env.CLIENT_URL}/payment/failed?orderId=${params.orderId}`,
                metadata: {
                    orderId: params.orderId,
                },
            });

            if (!session.url) throw new AppError("Failed to create Stripe session", 500);
            return session.url;
        } catch (error: any) {
            throw new AppError(`Stripe Error: ${error.message}`, 500);
        }
    };

    async verifyReturnUrl(query: any): Promise<any> {
        return {
            isSuccess: true,
            orderId: query.orderId,
            message: "Stripe processed",
        };
    };
}