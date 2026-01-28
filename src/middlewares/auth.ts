import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "./asyncHandler.js";
import { AuthError } from "../errors/AuthError.js";
import { verifyToken } from "../security/jwt.js";
import User from "../models/User.js";
import { AppError } from "../errors/AppError.js";
import mongoose from "mongoose";


export const authenticate = asyncHandler(async(
    req: Request,
    res: Response, 
    next: NextFunction
) => {
    
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer")){
        token = authHeader.split(" ")[1];
    }
    
    if (!token) {
        throw new AuthError("You are not logged in! Please log in to get access.")
    }

    const decoded = verifyToken(token) as { userId: string, role: string };
    const currentUser = await User.findById(decoded.userId).select("-password");
    if (!currentUser) {
        throw new AuthError("The user belonging to this token does no longer exist.")
    }

    req.user = currentUser;
    next();
});

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AuthError("You do not have permission to perform this action", 403));
        }
        next();
    };
};

export const checkOwnerOrAdmin = (
    modelName: string,
    ownerField: string = "author"
) => {
    return asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
        if (req.user.role === "admin") return next();
        
        const resourceId = req.params.id;
        if (!resourceId) throw new AppError("No resource ID provider", 400);

        const ModelSchema = mongoose.model(modelName);
        if (!ModelSchema) throw new AppError(`Model ${modelName} is not registered`, 500);

        const resource = await ModelSchema.findById(resourceId);
        if (!resource) throw new AppError(`${modelName} is not registered`, 404);

        const ownerId = resource[ownerField]?.toString();
        const userId = req.user._id.toString();
        if (ownerId !== userId) throw new AppError("You are not the owner of this resource", 403);
    })
};