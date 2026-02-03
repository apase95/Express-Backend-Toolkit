import Notification, { INotification, ICreateNotificationInput } from "./notification.model.js";
import { BaseRepository, Filter } from "../../core/database/base.repository.js";


class NotificationRepository extends BaseRepository<INotification> {
    constructor() {
        super(Notification);
    }

    async createNotification(data: ICreateNotificationInput): Promise<INotification> {
        return this.create(data as any);
    }

    async getByUser(userId: string, skip: number, limit: number) {
        const filter: Filter<INotification> = { userId: userId as any };
        
        const [notifications, total] = await Promise.all([
            this.model.find(filter as any)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.model.countDocuments(filter as any).exec(),
            this.model.countDocuments({ ...filter, isRead: false } as any).exec()
        ]);

        return { notifications, total, unreadCount: total };
    };

    async markAsRead(id: string, userId: string) {
        return this.model.findOneAndUpdate(
            { _id: id, userId } as any,
            { isRead: true },
            { new: true }
        ).exec();
    };

    async markAllAsRead(userId: string) {
        return this.model.updateMany(
            { userId, isRead: false } as any,
            { isRead: true }
        ).exec();
    };
}

export const notificationRepository = new NotificationRepository();
