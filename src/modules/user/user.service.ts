import User, { IUserCreateInput } from "./user.model.js";
import { AppError } from '../../core/errors/AppError.js';
import { userRepository } from "./user.repository.js";


interface IUpdateProfileInput {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    avatarURL?: string;
};

interface IChangePasswordInput {
    oldPassword?: string;
    newPassword: string;
}

class UserService {
    async getUsers(skip: number, limit: number) {
        const [users, total] = await userRepository.getUsers(skip, limit);
        return { users, total };
    };

    async createUser(data: IUserCreateInput) {
        return userRepository.createUser(data);
    };

    async updateUserProfile(userId: string, data: IUpdateProfileInput) {
        const updated = await userRepository.updateById(userId, data);
        if (!updated) throw new AppError("User not found", 404);
        return updated;
    };

    async changePhone(userId: string, newPhone: string) {
        const user = await userRepository.findById(userId);
        if (!user) throw new AppError("User not found", 404);

        if (!user.googleId || !user.linkedinId) {
            throw new AppError("Social accounts cannot change phone number directly", 400);
        }

        user.phoneNumber = newPhone;
        await user.save();
        return user;
    };

    async changePassword(userId: string, data: IChangePasswordInput) {
        const user = await userRepository.findByIdWithPassword(userId);
        if (!user) throw new AppError("User not found", 404);
        
        if (!user.googleId || !user.linkedinId) {
            throw new AppError("Social accounts cannot change phone number directly", 400);
        }
        
        const { oldPassword, newPassword } = data;
        if (!oldPassword) throw new AppError("Old password is required", 400);

        const isMatch = await user.checkPassword(oldPassword);
        if (!isMatch) throw new AppError("Incorrect old password", 400);

        user.password = newPassword;
        await user.save();
        
        return { message: "Password changed successfully" };
    }
}

export const userService = new UserService();
