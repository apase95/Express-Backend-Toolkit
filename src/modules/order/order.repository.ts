import Order, { IOrder, IOrderCreateInput } from "./order.model.js";
import { BaseRepository, Filter } from "../../core/database/base.repository.js";
import { PaymentStatus } from "../../core/constants/payment.constant.js";

class OrderRepository extends BaseRepository<IOrder> {
    constructor() {
        super(Order);
    }

    async createOrder(data: IOrderCreateInput): Promise<IOrder> {
        return this.create(data as any);
    };

    async findByUserId(userId: string, skip: number, limit: number) {
        const filter: Filter<IOrder> = { userId: userId as any };
        
        const [orders, total] = await Promise.all([
            this.model.
                find(filter as any)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),

            this.model
                .countDocuments(filter as any)
                .exec()
        ]);
        return { orders, total };
    };

    async updateStatus(
        orderId: string, 
        status: PaymentStatus
    ): Promise<IOrder | null> {
        return this.updateById(orderId, { status });
    };
}

export const orderRepository = new OrderRepository();