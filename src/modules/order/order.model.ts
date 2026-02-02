import { Schema, model, Types, InferSchemaType, HydratedDocument, Model } from "mongoose";
import { PaymentProvider, PaymentStatus } from "../../core/constants/payment.constant.js";


const orderSchema = new Schema({
    userId: { 
        type: Types.ObjectId, 
        ref: 'User', 
        index: true,
        required: true ,
    },
    items: [{
        productId: { type: String, required: true },
        name: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { 
        type: Number, 
        required: true 
    },
    currency: { 
        type: String, 
        default: 'VND' 
    },
    status: { 
        type: String, 
        enum: Object.values(PaymentStatus), 
        default: PaymentStatus.PENDING 
    },
    paymentProvider: { 
        type: String, 
        enum: Object.values(PaymentProvider),
        required: true
    },
    description: String,
}, { timestamps: true });

export type OrderRaw = InferSchemaType<typeof orderSchema>;
export type IOrder = HydratedDocument<OrderRaw>;

export interface IOrderCreateInput {
    userId: string;
    items: Array<{
        productId: string;
        name: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    paymentProvider: string;
    description?: string;
}

const Order = model<IOrder>("Order", orderSchema);
export default Order;