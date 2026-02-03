import Transaction, { ITransaction } from "./transaction.model.js";
import { BaseRepository, Filter } from "../../core/database/base.repository.js";


class TransactionRepository extends BaseRepository<ITransaction> {
    constructor() {
        super(Transaction);
    };

    async findByOrderId(orderId: string): Promise<ITransaction | null> {
        return this.model.findOne({ orderId }).exec();
    };

    async findByProviderTransactionId(
        providerTransId: string
    ): Promise<ITransaction | null> {
        return this.findOne({ providerTransactionId: providerTransId } as Filter<ITransaction>);
    };
};


export const transactionRepository = new TransactionRepository();