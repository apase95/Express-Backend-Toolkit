import { Request } from "express";

export interface CreatePaymentParams {
    orderId: string;
    amount: number;
    orderDescription: string;
    ipAddr: string;
    language?: string;
    bankCode?: string; 
}

export interface IPaymentGateway {
    createPaymentUrl(params: CreatePaymentParams): Promise<string>;

    verifyReturnUrl(query: any): Promise<{
        isSuccess: boolean;
        orderId: string;
        transactionId?: string;
        message?: string;
    }>;
}