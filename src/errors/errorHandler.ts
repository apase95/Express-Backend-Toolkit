import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError.js";

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    console.error("Check System Error: ",err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
}
