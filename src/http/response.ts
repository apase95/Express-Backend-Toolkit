import { type Response } from "express";

export function ok(res: Response, data: any = null) {
    return res.status(200).json({
        success: true,
        data
    });
}

export function created(res: Response, data: any) {
    return res.status(201).json({
        success: true,
        data
    });
}

export function fail(res: Response, message: string, statusCode: number = 400) {
    return res.status(statusCode).json({
        success: false,
        message
    });
}
