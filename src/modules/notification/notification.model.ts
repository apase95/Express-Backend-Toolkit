import { Schema, model, Types, InferSchemaType, HydratedDocument } from "mongoose";
import { NotificationType } from "../../core/constants/notification.constant.js";


const notificationSchema = new Schema({
    userId: { 
        type: Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    type: { 
        type: String, 
        enum: Object.values(NotificationType), 
        default: NotificationType.SYSTEM 
    },
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    metadata: { 
        type: Schema.Types.Mixed
    }
}, { timestamps: true });


export type NotificationRaw = InferSchemaType<typeof notificationSchema>;
export type INotification = HydratedDocument<NotificationRaw>;

export interface ICreateNotificationInput {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: any;
}

const Notification = model<INotification>("Notification", notificationSchema);
export default Notification;