import { Request, Response } from "express";
import { asyncHandler } from "../../core/middlewares/async-handler.middleware.js";
import { healthService } from "./health.service.js";


export const checkHealth = asyncHandler(async (req: Request, res: Response) => {
    const result = await healthService.getHealth();
    
    const statusCode = result.status === "OK" ? 200 : 503;
    
    res.status(statusCode).json(result);
});