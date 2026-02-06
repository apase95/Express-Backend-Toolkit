import { BaseRepository, Filter } from "../../core/database/base.repository.js";
import Session, { ISession } from "./session.model.js";


class SessionRepository extends BaseRepository<ISession>{
    constructor() {
        super(Session);
    };

    async createSession(data: Partial<ISession>): Promise<ISession> {
        return this.create(data);
    };

    async findByUserId(userId: string): Promise<ISession[]> {
        return this.findMany({ userId } as Filter<ISession>);
    };

    async deleteByUserId(userId: string) {
        return this.model.deleteMany({ userId }).exec();
    };
};

export const sessionRepository = new SessionRepository();