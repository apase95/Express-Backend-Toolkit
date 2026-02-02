import { Request, Response } from "express";
import { asyncHandler } from "../../core/middlewares/async-handler.middleware.js";
import { paymentService } from "./payment.service.js";
import { ok } from "../../core/http/response.js";

export const createPaymentUrl = asyncHandler(async (req: Request, res: Response) => {
    const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userId = req.user?._id.toString();

    const url = await paymentService.createPaymentUrl({
        ...req.body,
        userId,
        ipAddr: typeof ipAddr === 'string' ? ipAddr : '127.0.0.1'
    });

    return ok(res, { url });
});

export const vnpayReturn = asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentService.handleVnpayReturn(req.query);
    
    if (result.isSuccess) {
        res.redirect(`${process.env.CLIENT_URL}/payment/success?orderId=${result.orderId}`);
    } else {
        res.redirect(`${process.env.CLIENT_URL}/payment/failed?orderId=${result.orderId}`);
    }
});