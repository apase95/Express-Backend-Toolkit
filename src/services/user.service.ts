import User, { IUserCreateInput } from "../models/user.model.js";

class UserService {
    async getUsers(skip: number, limit: number) {
        const [users, total] = await Promise.all([
            User.find().skip(skip).limit(limit),
            User.countDocuments()
        ]);
        return { users, total };
    }

    async createUser(data: IUserCreateInput) {
        return User.create(data);
    }
}

export const userService = new UserService();
