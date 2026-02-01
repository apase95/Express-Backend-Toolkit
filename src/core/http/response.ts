import { type Response } from "express";
import { HttpCode } from "./status.js";

export function ok<T>(
    res: Response, 
    data: T,
    message: string = "Success"
) {
    return res.status(HttpCode.OK).json({
        success: true,
        message,
        data
    });
}

export function created<T>(
    res: Response, 
    data: T,
    message: string = "Resource created successfully"
) {
    return res.status(HttpCode.CREATED).json({
        success: true,
        message,
        data
    });
}

export function noContent(res: Response) {
    return res.status(HttpCode.NO_CONTENT).send();
}
