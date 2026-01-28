import { Request, Response, NextFunction } from "express";
import { HttpCode } from "../http/status.js";

interface RateLimitOption {
    windowMs: number;
    max: number;
    message?: string;
}

const requests = new Map<string, { count: number; startTime: number }>();

export const rateLimiter = (options: RateLimitOption) => {
    return (req: Request, res: Response, next: NextFunction) => {
        
        const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown-ip';
        const now = Date.now();
        
        const record = requests.get(ip as string);
        if (!record || now - record.startTime > options.windowMs) {
            requests.set(ip as string, { count: 1, startTime: now });
            return next();
        }

        if (record.count >= options.max) {
            const msg = options.message || "Too many requests, please try again later.";
            return res.status(HttpCode.TOO_MANY_REQUESTS).json({
                success: false,
                message: msg
            });
        }

        record.count += 1;
        next();
    };
};

setInterval(() => {
    const now = Date.now();
    requests.forEach((value, key) => {
        if (now - value.startTime > 60000 * 60) { 
            requests.delete(key);
        }
    });
}, 60000 * 60);