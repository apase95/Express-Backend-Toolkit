import { IOrderCreateInput } from "./order.model.js";
import { orderRepository } from "./order.repository.js";
import { AppError } from "../../core/errors/AppError.js";

class OrderService {
    
    async createOrder(data: IOrderCreateInput) {
        return await orderRepository.createOrder(data);
    };

    async getMyOrders(userId: string, skip: number, limit: number) {
        return await orderRepository.findByUserId(userId, skip, limit);
    };

    async getOrderById(orderId: string, userId: string) {
        const order = await orderRepository.findById(orderId);
        if (!order) throw new AppError("Order not found", 404);
        
        if (order.userId.toString() !== userId) {
            throw new AppError("You do not have permission to view this order", 403);
        }

        return order;
    };

    async updateOrderStatus(orderId: string, status: string) {
        return await orderRepository.updateStatus(orderId, status);
    };
};

export const orderService = new OrderService();