import { ICreateNotificationInput } from "./notification.model.js";
import { notificationRepository } from "./notification.repository.js";
import { logger } from "../../core/logger/logger.js";


class NotificationService {
    
    async send(data: ICreateNotificationInput) {
        try {
            const notification = await notificationRepository.createNotification(data);
            return notification;
        } catch (error) {
            logger.error(`Failed to create notification for user ${data.userId}: ${error}`);
        }
    };

    async getMyNotifications(userId: string, skip: number, limit: number) {
        return await notificationRepository.getByUser(userId, skip, limit);
    };

    async markAsRead(id: string, userId: string) {
        return await notificationRepository.markAsRead(id, userId);
    };

    async markAllAsRead(userId: string) {
        return await notificationRepository.markAllAsRead(userId);
    };
}

export const notificationService = new NotificationService();