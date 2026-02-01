import User, { IUser, IUserCreateInput } from "./user.model.js";
import { BaseRepository } from "../../core/database/base.repository.js";


class UserRepository extends BaseRepository<IUser>{
    
    constructor() {
        super(User);
    };

    findByEmail(email: string) {
        return this.model.findOne({ email });
    };

    findWithPasswordByEmail(email: string) {
        return this.model
            .findOne({ email })
            .select("+hashedPassword");
    };

    findByIdWithPassword(id: string) {
        return this.model
            .findById(id)
            .select("+hashedPassword");
    };

    createUser(data: IUserCreateInput) {
        return this.model.create(data);
    };

    getUsers(skip: number, limit: number) {
        return Promise.all([
            this.model.find().skip(skip).limit(limit),
            this.model.countDocuments()
        ]);
    };
};

export const userRepository = new UserRepository();