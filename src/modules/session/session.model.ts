import { Schema, model, Types, InferSchemaType, HydratedDocument } from "mongoose";


const sessionSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    refreshToken: {
        type: String, 
        required: true,
    },
    userAgent: {
        type: String,
    },
    ipAddress: {
        type: String,
    },
    expireAt: {
        type: Date,
        required: true,
        expires: 0,
    },
}, { timestamps: true });

export type SessionRaw = InferSchemaType<typeof sessionSchema>;
export type ISession = HydratedDocument<SessionRaw>;

const Session = model<ISession>("Session", sessionSchema);
export default Session;