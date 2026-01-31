import { updateUserProfile, changePhone } from './../controllers/user.controller';
import User, { IUserCreateInput } from "../models/user.model.js";
import { AppError } from '../errors/AppError.js';


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
        const [users, total] = await Promise.all([
            User.find().skip(skip).limit(limit),
            User.countDocuments()
        ]);
        return { users, total };
    };

    async createUser(data: IUserCreateInput) {
        return User.create(data);
    };

    async updateUserProfile(userId: string, data: IUpdateProfileInput) {
        const updateData = {
            displayName: data.displayName,
            firstName: data.firstName,
            lastName: data.lastName,
            avatarURL: data.avatarURL,
        };

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!updatedUser) throw new AppError("User not found", 404);
        return updatedUser;
    };

    async changePhone(userId: string, newPhone: string) {
        const user = await User.findById(userId);
        if (!user) throw new AppError("User not found", 404);

        if (!user.googleId || !user.linkedinId) {
            throw new AppError("Social accounts cannot change phone number directly", 400);
        }

        user.phoneNumber = newPhone;
        await user.save();
        return user;
    };

    async changePassword(userId: string, data: IChangePasswordInput) {
        const { oldPassword, newPassword } = data;
        const user = await User.findById(userId).select("+hashedPassword");
        if (!user) throw new AppError("User not found", 404);

        if (!user.googleId || !user.linkedinId) {
            throw new AppError("Social accounts cannot change phone number directly", 400);
        }
        
        if (!oldPassword) throw new AppError("Old password is required", 400);

        const isMatch = await user.checkPassword(oldPassword);
        if (!isMatch) throw new AppError("Incorrect old password", 400);

        user.password = newPassword;
        await user.save();
        
        return { message: "Password changed successfully" };
    }
}

export const userService = new UserService();
