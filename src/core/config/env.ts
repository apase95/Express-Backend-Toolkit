import dotenv from "dotenv";
import { z, ZodError } from "zod";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(5000),
    CLIENT_URL: z.url(),
    SERVER_URL: z.url(),

    MONGO_URI: z.url(),

    API_KEY: z.string().min(1),
    ACCESS_TOKEN_SECRET: z.string().min(1),
    REFRESH_TOKEN_SECRET: z.string().min(1),
    ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),

    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),

    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GOOGLE_CALLBACK_URL: z.string(),

    LINKEDIN_CLIENT_ID: z.string().min(1),
    LINKEDIN_CLIENT_SECRET: z.string().min(1),
    LINKEDIN_CALLBACK_URL: z.string(),

    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.email(),
    SMTP_PASS: z.string().min(1),

    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_API_VERSION: z.string().default("2026-01-28.clover"), 

    VNP_TMN_CODE: z.string().optional(),
    VNP_HASH_SECRET: z.string().optional(),
    VNP_URL: z.string().default("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"),
    VNP_RETURN_URL: z.string().default("http://localhost:5000/api/v1/payments/vnpay-return"),

    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_PREFIX: z.string().default("express-toolkit:"), 
});

try {
    var validatedEnv = envSchema.parse(process.env);
} catch (error) {
    if (error instanceof ZodError) {
        console.error("Invalid environment variables:");
        error.issues.forEach((err) => {
            console.error(`-> ${err.path.join(".")}: ${err.message}`);
        });
        process.exit(1);
    }
    throw error;
}

export const env = validatedEnv;