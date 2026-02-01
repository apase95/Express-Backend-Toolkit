import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError.js";
import { ZodError } from "zod";
import { logger } from "../logger/logger.js";

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    let error = err;
    if (!error.statusCode) {
        error.statusCode = 500;
    }

    //Handle Zod Error
    if (err instanceof ZodError) {
        const message = "Validation Error";
        const errors = err.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
        }));

        return res.status(400).json({
            success: false,
            message,
            errors,
        });
    }

    //Handle Mongoose (ID, Duplicate) Error
    if (err.name === "CastError") {
        const message = `Invalid resource format: '${err.path}'`;
        error = new AppError(message, 400);
    }
    if (err.code === 11000) {
        const match = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/) : null;
        const value = match ? match[0] : "Unknown";
        const message = `Duplicate field value: ${value}. Please use another value!`;
        error = new AppError(message, 400);
    }

    //Handle JWT Error
    if (err.name === "JsonWebTokenError") {
        const message = "Invalid token. Please log in again!";
        error = new AppError(message, 401);
    }
    if (err.name === "TokenExpiredError") {
        const message = "Your token has expired! Please log in again.";
        error = new AppError(message, 401);
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        });
    }

    logger.error(err);

    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}
