import { Request, Response } from "express";
import { paymentService } from "../payment.service.js";
import { PaymentManager } from "../payment.manager.js";
import { PaymentProvider } from "../../../core/constants/payment.constant.js";
import { logger } from "../../../core/logger/logger.js";


export const vnpayIpn = async (req: Request, res: Response) => {
    try {
        const vnpayService = PaymentManager.getService(PaymentProvider.VNPAY);
        const verify = await vnpayService.verifyReturnUrl(req.query);

        if (!verify.isSuccess && verify.message === "Invalid Signature") {
            return res.status(200).json({ RspCode: "97", Message: "Invalid Checksum" });
        }

        const result = await paymentService.handleVnpayIpn(req.query, verify);

        return res.status(200).json(result);

    } catch (error) {
        logger.error(`VNPAY IPN Error: ${error}`);
        return res.status(200).json({ RspCode: "99", Message: "Unknown Error" });
    }
};