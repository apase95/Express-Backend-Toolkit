import { env } from "./env.js";

export const paymentConfig = {
    stripe: {
        secretKey: env.STRIPE_SECRET_KEY,
        webhookSecret: env.STRIPE_WEBHOOK_SECRET,
        apiVersion: env.STRIPE_API_VERSION,
    },
    vnpay: {
        tmnCode: env.VNP_TMN_CODE,
        hashSecret: env.VNP_HASH_SECRET,
        url: env.VNP_URL,
        returnUrl: env.VNP_RETURN_URL,
    },
} as const;