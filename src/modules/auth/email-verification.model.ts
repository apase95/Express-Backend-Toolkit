import { Schema, model, Types, InferSchemaType, HydratedDocument } from "mongoose";


const emailVerificationSchema = new Schema({
    userId: { 
        type: Types.ObjectId, 
        ref: 'User', 
        required: true,
    },
    token: { 
        type: String, 
        required: true,
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 86400,
    }
});


export type EmailVerificationRaw = InferSchemaType<typeof emailVerificationSchema>;
export type IEmailVerification = HydratedDocument<EmailVerificationRaw>;


const EmailVerification = model<IEmailVerification>("EmailVerification", emailVerificationSchema);
export default EmailVerification;