import cors from 'cors';
import helmet from "helmet";
import { config } from './index.config.js';
import hpp from 'hpp';


export const helmetMiddleware = helmet({
    xPoweredBy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self','unsafe-inline'"]
        },
    },
    xContentTypeOptions: true,
    xXssProtection: true,
    strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
});

export const corsMiddleware = cors({
    origin: (origin, callback) => {
        const whiteList = [config.app.clientUrl];
        if (!origin || whiteList.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error(`CORS Error: Origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-api-key', 'x-request-id'],
});

export const hppMiddleware = hpp({
    // whitelist: ["filter"],
});