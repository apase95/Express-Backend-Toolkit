import { Request, Response } from "express";
import { asyncHandler } from "../../core/middlewares/async-handler.middleware.js";
import { ok, created } from "../../core/http/response.js";
import { getPaginationParams, getPagingData } from "../../core/http/pagination.js";
import { orderService } from "./order.service.js";


export const createOrder = asyncHandler(async(
    req: Request, 
    res: Response
) => {
    const userId = req.user!._id.toString();
        
    const newOrder = await orderService.createOrder({
        ...req.body,
        userId
    });

    return created(res, newOrder, "Order created successfully");
});

export const getMyOrders = asyncHandler(async(
    req: Request, 
    res: Response
) => {
    const userId = req.user!._id.toString();
    const { page, limit, skip } = getPaginationParams(req.query);

    const { orders, total } = await orderService.getMyOrders(userId, skip, limit);
    
    const responseData = getPagingData(orders, total, page, limit);
    return ok(res, responseData);
});

export const getOrderDetail = asyncHandler(async(
    req: Request, 
    res: Response
) => {
    const userId = req.user!._id.toString();
    const id = req.params.id as string;

    const order = await orderService.getOrderById(id, userId);
    return ok(res, order);
});