import { PaymentManager } from "./payment.manager.js";
import { transactionRepository } from "./transaction.repository.js";
import { PaymentProvider, PaymentStatus } from "../../core/constants/payment.constant.js";


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

    async handleVnpayReturn(query: any) {
        const vnpayService = PaymentManager.getService(PaymentProvider.VNPAY);
        const result = await vnpayService.verifyReturnUrl(query);
        const { orderId, isSuccess } = result;
        const transaction = await transactionRepository.findByOrderId(orderId);
        
        if (transaction) {
            transaction.status = isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
            transaction.metadata = query;
            await transaction.save();
        }

        return result;
    };
}

export const paymentService = new PaymentService();