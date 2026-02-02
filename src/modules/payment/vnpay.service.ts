import crypto from "node:crypto";
import qs from "qs";
import { env } from "../../core/config/env.js";
import { CreatePaymentParams, IPaymentGateway } from "./interfaces/payment.interface.js";


export class VnpayService implements IPaymentGateway {
    
    async createPaymentUrl(params: CreatePaymentParams): Promise<string> {
        const date = new Date();
        const createDate = this.formatDate(date);
        
        const vnpParams: any = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: env.VNP_TMN_CODE,
            vnp_Locale: params.language || "vn",
            vnp_CurrCode: "VND",
            vnp_TxnRef: params.orderId,
            vnp_OrderInfo: params.orderDescription,
            vnp_OrderType: "other",
            vnp_Amount: params.amount * 100,
            vnp_ReturnUrl: env.VNP_RETURN_URL,
            vnp_IpAddr: params.ipAddr,
            vnp_CreateDate: createDate,
        };

        if (params.bankCode) {
            vnpParams["vnp_BankCode"] = params.bankCode;
        }

        const sortedParams = this.sortObject(vnpParams);
        const signData = qs.stringify(sortedParams, { encode: false });

        const hmac = crypto.createHmac("sha512", env.VNP_HASH_SECRET!);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        sortedParams["vnp_SecureHash"] = signed;

        return `${env.VNP_URL}?${qs.stringify(sortedParams, { encode: false })}`;
    };

    async verifyReturnUrl(query: any): Promise<{ isSuccess: boolean; orderId: string; message?: string }> {
        let vnp_Params = query;
        const secureHash = vnp_Params["vnp_SecureHash"];

        delete vnp_Params["vnp_SecureHash"];
        delete vnp_Params["vnp_SecureHashType"];

        vnp_Params = this.sortObject(vnp_Params);

        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", env.VNP_HASH_SECRET!);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        const orderId = vnp_Params["vnp_TxnRef"];
        const rspCode = vnp_Params["vnp_ResponseCode"];

        if (secureHash === signed) {
            if (rspCode === "00") {
                return { isSuccess: true, orderId };
            } else {
                return { isSuccess: false, orderId, message: "Payment failed or cancelled" };
            }
        } else {
            return { isSuccess: false, orderId, message: "Invalid Signature" };
        }
    };

    private sortObject(obj: any) {
        const sorted: any = {};
        const str = [];
        const keys = Object.keys(obj).sort();

        keys.forEach((key) => {
            sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
        });

        return sorted;
    };

    private formatDate(date: Date): string {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
    };
}