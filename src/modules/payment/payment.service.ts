import { PaymentManager } from "./payment.manager.js";
import { transactionRepository } from "./transaction.repository.js";
import { PaymentProvider, PaymentStatus } from "../../core/constants/payment.constant.js";
import { orderService } from "../order/order.service.js";


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

    async confirmPaymentSuccess(orderId: string, providerTransactionId?: string) {
        const transaction = await transactionRepository.findByOrderId(orderId);
        
        if (transaction) {
            if (transaction.status === PaymentStatus.SUCCESS) return;

            transaction.status = PaymentStatus.SUCCESS;
            if (providerTransactionId) {
                transaction.providerTransactionId = providerTransactionId;
            }
            await transaction.save();
        }

        await orderService.updateOrderStatus(orderId, PaymentStatus.SUCCESS);
    };

    async handleVnpayIpn(query: any, verifyResult: any) {
        const { orderId, isSuccess, transactionId } = verifyResult;

        const transaction = await transactionRepository.findByOrderId(orderId);
        if (!transaction) {
            return { RspCode: "01", Message: "Order not found" };
        }

        if (transaction.status === PaymentStatus.SUCCESS && isSuccess) {
            return { RspCode: "02", Message: "Order already confirmed" };
        }

        transaction.metadata = query;
        if (transactionId) transaction.providerTransactionId = transactionId;
        
        if (isSuccess) {
            transaction.status = PaymentStatus.SUCCESS;
            await orderService.updateOrderStatus(orderId, PaymentStatus.SUCCESS);
        } else {
            transaction.status = PaymentStatus.FAILED;
        }

        await transaction.save();
        return { RspCode: "00", Message: "Confirm Success" };
    };

    async handleVnpayReturn(query: any) {
        const vnpayService = PaymentManager.getService(PaymentProvider.VNPAY);
        const result = await vnpayService.verifyReturnUrl(query);
        
        if (result.isSuccess) {
            await this.confirmPaymentSuccess(result.orderId, result.transactionId);
        }
        
        return result;
    };
}

export const paymentService = new PaymentService();