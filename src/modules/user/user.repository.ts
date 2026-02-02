import User, { IUser, IUserCreateInput }  from "./user.model.js";
import { BaseRepository, Filter } from "../../core/database/base.repository.js";


class UserRepository extends BaseRepository<IUser>{
    
    constructor() {
        super(User);
    };

    findByEmail(email: string): Promise<IUser | null> {
        return this.findOne({ email } as Filter<IUser>);
    };

    findWithPasswordByEmail(email: string): Promise<IUser | null> {
        return this.model
            .findOne({ email })
            .select("+hashedPassword")
            .exec();
    };

    findByIdWithPassword(id: string): Promise<IUser | null> {
        return this.model
            .findById(id)
            .select("+hashedPassword")
            .exec();
    };

    createUser(data: IUserCreateInput): Promise<IUser | null> {
        return this.create(data as any);
    };

    async getUsers(skip: number, limit: number) {
        const [users, total] = await Promise.all([
            this.model.find().skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
            this.model.countDocuments().exec()
        ]);
        return { users, total };
    };
};

export const userRepository = new UserRepository();