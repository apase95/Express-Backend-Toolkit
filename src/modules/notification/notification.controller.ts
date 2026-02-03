import { Request, Response } from "express";
import { asyncHandler } from "../../core/middlewares/async-handler.middleware.js";
import { ok } from "../../core/http/response.js";
import { getPaginationParams, getPagingData } from "../../core/http/pagination.js";
import { notificationService } from "./notification.service.js";


export const getMyNotifications = asyncHandler(async(
    req: Request, 
    res: Response
) => {
    const userId = req.user!._id.toString();
    const { page, limit, skip } = getPaginationParams(req.query);

    const result = await notificationService.getMyNotifications(userId, skip, limit);
    
    return ok(res, {
        data: result.notifications,
        meta: {
            ...getPagingData(result.notifications, result.total, page, limit).meta,
            unreadCount: result.unreadCount
        }
    });
});

export const markAsRead = asyncHandler(async(
    req: Request, 
    res: Response
) => {
    const userId = req.user!._id.toString();
    const id = req.params.id as string;
    await notificationService.markAsRead(id, userId);
    return ok(res, null, "Marked as read");
});

export const markAllAsRead = asyncHandler(async(
    req: Request, 
    res: Response
) => {
    const userId = req.user!._id.toString();
    await notificationService.markAllAsRead(userId);
    return ok(res, null, "All marked as read");
});