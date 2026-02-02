import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";
import { PaymentProvider, PaymentStatus } from "../../core/constants/payment.constant.js";


const transactionSchema = new Schema({
    orderId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Order', 
        required: true,
        index: true,
    },
    userId: { 
        type: Schema.Types.ObjectId,  
        ref: 'User' 
    },
    provider: { 
        type: String, 
        enum: Object.values(PaymentProvider), 
        required: true 
    },
    amount: {
        type: Number,
        required: true
    },
    currency: { 
        type: String, 
        default: 'VND' 
    },
    providerTransactionId: { 
        type: String 
    }, 
    status: { 
        type: String, 
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING
    },
    metadata: { 
        type: Schema.Types.Mixed 
    },
    paymentUrl: { 
        type: String 
    }
}, { timestamps: true });

export type TransactionRaw = InferSchemaType<typeof transactionSchema>;
export type ITransaction = HydratedDocument<TransactionRaw>;

const Transaction = model<ITransaction>("Transaction", transactionSchema);
export default Transaction;