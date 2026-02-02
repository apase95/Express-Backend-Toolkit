import { IPaymentGateway } from "./interfaces/payment.interface.js";
import { PaymentProvider } from "../../core/constants/payment.constant.js";
import { StripeService } from "./stripe.service.js";
import { VnpayService } from "./vnpay.service.js";
import { AppError } from "../../core/errors/AppError.js";

export class PaymentManager {
    private static strategies = new Map<string, IPaymentGateway>();

    static register(provider: string, strategy: IPaymentGateway) {
        this.strategies.set(provider, strategy);
    };

    static getService(provider: string): IPaymentGateway {
        if (this.strategies.size === 0) {
            this.register(PaymentProvider.STRIPE, new StripeService());
            this.register(PaymentProvider.VNPAY, new VnpayService());
        }

        const service = this.strategies.get(provider);
        if (!service) {
            throw new AppError(`Payment provider '${provider}' is not supported`, 400);
        }
        return service;
    };
}