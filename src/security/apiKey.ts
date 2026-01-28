import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import crypto from "node:crypto"; 


const API_KEY_HEADER = "x-api-key";

export const aptKeyGuard = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const apiKey = req.headers[API_KEY_HEADER] as string;
    if (!apiKey) {
        return next(new AppError("Missing API Key", 401));
    }
    
    const validApiKey = process.env.API_KEY;
    if (!validApiKey) {
        console.error("API_KEY is not defined in .env")
        return next(new AppError(("Internal Server Configuration Error"), 500));
    }

    const bufferApiKey = Buffer.from(apiKey);
    const bufferValidKey = Buffer.from(validApiKey);
    
    if (bufferApiKey.length !== bufferValidKey.length) {
        return next(new AppError("Invalid API Key", 403));
    }

    const isValid = crypto.timingSafeEqual(bufferApiKey, bufferValidKey);
    if (!isValid) {
        return next(new AppError("Invalid API Key", 403));
    }

    next();
};