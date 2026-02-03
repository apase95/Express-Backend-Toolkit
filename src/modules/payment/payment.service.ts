import { PaymentManager } from "./payment.manager.js";
import { transactionRepository } from "./transaction.repository.js";
import { PaymentProvider, PaymentStatus } from "../../core/constants/payment.constant.js";
import { orderService } from "../order/order.service.js";
import { logger } from "../../core/logger/logger.js";
import { AppError } from "../../core/errors/AppError.js";


interface CreatePaymentRequest {
    userId: string;
    orderId: string;
    amount: number;
    provider: string;
    ipAddr: string;
}

class PaymentService {
    
    async createPaymentUrl(data: CreatePaymentRequest) {
        const { orderId, amount, provider, ipAddr, userId } = data;

        const paymentGateway = PaymentManager.getService(provider);
        const paymentUrl = await paymentGateway.createPaymentUrl({
            orderId,
            amount,
            orderDescription: `Payment for order ${orderId}`,
            ipAddr
        });

        await transactionRepository.create({
            orderId: orderId as any,
            userId: userId as any,
            amount,
            provider: provider as PaymentProvider,
            status: PaymentStatus.PENDING,
            paymentUrl
        });

        return paymentUrl;
    };

    async confirmPaymentSuccess(
        orderId: string, 
        providerTransactionId?: string, 
        metadata: any = {}
    ) {
        if (providerTransactionId) {
            const existingTx = await transactionRepository.findByProviderTransactionId(providerTransactionId);
            if (existingTx) {
                logger.warn(`Transaction ${providerTransactionId} already processed. Skipping.`);
                return;
            }
        }
        
        const transaction = await transactionRepository.findByOrderId(orderId);
        if (!transaction) {
            logger.error(`Transaction not found for order ${orderId}`);
            throw new AppError("Transaction not found", 404);
        }
        
        if (transaction.status === PaymentStatus.SUCCESS) return;
        transaction.status = PaymentStatus.SUCCESS;
        if (providerTransactionId) transaction.providerTransactionId = providerTransactionId;
        transaction.metadata = metadata;

        await transaction.save();
        await orderService.updateOrderStatus(orderId, PaymentStatus.SUCCESS);
    };

    async handlePaymentFailed(orderId: string, providerTransactionId?: string, reason?: string) {

        const transaction = await transactionRepository.findByOrderId(orderId);
        if (!transaction) throw new AppError("Transaction not found", 404);

        if (transaction.status === PaymentStatus.SUCCESS) return;
        transaction.status = PaymentStatus.FAILED;

        if (providerTransactionId) transaction.providerTransactionId = providerTransactionId;
        transaction.metadata = { reason, ...transaction.metadata };
        
        await transaction.save();
        await orderService.updateOrderStatus(orderId, PaymentStatus.FAILED);
    };

    async handleVnpayIpn(query: any, verifyResult: any) {
        const { orderId, isSuccess, transactionId } = verifyResult;

        try {
            if (isSuccess) {
                await this.confirmPaymentSuccess(orderId, transactionId, query);
                return { RspCode: "00", Message: "Confirm Success" };
            } else {
                await this.handlePaymentFailed(orderId, transactionId, "VNPAY Returned Error");
                return { RspCode: "00", Message: "Confirm Success (Order Failed)" };
            }
        } catch (error: any) {
            if (error.statusCode === 404) {
                return { RspCode: "01", Message: "Order not found" };
            }
            if (error.message && error.message.includes("already processed")) {
                return { RspCode: "02", Message: "Order already confirmed" };
            }
            throw error;
        }
    };

    async handleVnpayReturn(query: any) {
        const vnpayService = PaymentManager.getService(PaymentProvider.VNPAY);
        const result = await vnpayService.verifyReturnUrl(query);
        
        try {
            if (result.isSuccess) {
                await this.confirmPaymentSuccess(result.orderId, result.transactionId!, query);
            } else {
                await this.handlePaymentFailed(result.orderId, result.transactionId, "VNPAY Return Failed");
            }
        } catch (error) {
            logger.warn(`VNPAY Return update skipped: ${error}`);
        }
        
        return result;
    };
}

export const paymentService = new PaymentService();