import Transaction, { ITransaction } from "./transaction.model.js";
import { BaseRepository } from "../../core/database/base.repository.js";

class TransactionRepository extends BaseRepository<ITransaction> {
    constructor() {
        super(Transaction);
    };

    async findByOrderId(orderId: string): Promise<ITransaction | null> {
        return this.model.findOne({ orderId }).exec();
    };
}

export const transactionRepository = new TransactionRepository();