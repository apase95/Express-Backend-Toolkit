import { Schema, model, Types, InferSchemaType, HydratedDocument } from "mongoose";


const passwordResetSchema = new Schema({
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
        expires: 3600,
    }
});


export type PasswordResetRaw = InferSchemaType<typeof passwordResetSchema>;
export type IPasswordReset = HydratedDocument<PasswordResetRaw>;

const PasswordReset = model<IPasswordReset>("PasswordReset", passwordResetSchema);
export default PasswordReset;