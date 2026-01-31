import dotenv from "dotenv";

dotenv.config();

const getEnv = (
    key: string, 
    defaultValue?: string
): string => {
    
    const value = process.env[key];
    if (value) return value;
    if (defaultValue) return defaultValue;

    throw new Error(`Missing required environment variable: ${key}`);
};

export const config = {
    app: {
        env: process.env.NODE_ENV || "development",
        port: Number(getEnv("PORT", "5000")),
        clientUrl: getEnv("CLIENT_URL", "http://localhost:3000"),
        serverUrl: getEnv("SERVER_URL", "http://localhost:5000"),
    },
    db: {
        uri: getEnv("MONGO_URI"),
    },
    jwt: {
        accessSecret: getEnv("ACCESS_TOKEN_SECRET"),
        refreshSecret: getEnv("REFRESH_TOKEN_SECRET"),
        accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
        refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    },
    security: {
        apiKey: getEnv("API_KEY"),
    },
    cloudinary: {
        name: getEnv("CLOUDINARY_CLOUD_NAME"),
        key: getEnv("CLOUDINARY_API_KEY"),
        secret: getEnv("CLOUDINARY_API_SECRET"),
    },
    oauth: {
        google: {
            clientId: getEnv("GOOGLE_CLIENT_ID"),
            clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
            callbackUrl: getEnv("GOOGLE_CALLBACK_URL", "/auth/google/callback"),
        },
        linkedin: {
            clientId: getEnv("LINKEDIN_CLIENT_ID"),
            clientSecret: getEnv("LINKEDIN_CLIENT_SECRET"),
            callbackUrl: getEnv("LINKEDIN_CALLBACK_URL", "/api/auth/linkedin/callback"),
        }
    }
} as const;