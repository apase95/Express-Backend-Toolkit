import { env } from "./env.js";

export const config = {
    app: {
        env: env.NODE_ENV,
        port: env.PORT,
        clientUrl: env.CLIENT_URL,
        serverUrl: env.SERVER_URL,
    },
    db: {
        uri: env.MONGO_URI,
    },
    jwt: {
        accessSecret: env.ACCESS_TOKEN_SECRET,
        refreshSecret: env.REFRESH_TOKEN_SECRET,
        accessExpiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
        refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    },
    security: {
        apiKey: env.API_KEY,
    },
    cloudinary: {
        name: env.CLOUDINARY_CLOUD_NAME,
        key: env.CLOUDINARY_API_KEY,
        secret: env.CLOUDINARY_API_SECRET,
    },
    oauth: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            callbackUrl: env.GOOGLE_CALLBACK_URL,
        },
        linkedin: {
            clientId: env.LINKEDIN_CLIENT_ID,
            clientSecret: env.LINKEDIN_CLIENT_SECRET,
            callbackUrl: env.LINKEDIN_CALLBACK_URL,
        }
    },
    email: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
    redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
        prefix: env.REDIS_PREFIX,
    },
    payment: {
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
        }
    },
} as const;

