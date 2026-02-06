import { IUserCreateInput, UserRole } from "./user.model.js";
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

interface GetUsersQuery {
    page?: number;
    limit?: number;
    keyword?: string;
    role?: string;
}

class UserService {
    async getAllUsers(query: GetUsersQuery) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (query.keyword) {
            const regex = new RegExp(query.keyword, 'i');
            filter.$or = [
                { displayName: regex },
                { email: regex },
            ];
        }
        if (query.role) filter.role = query.role;

        return await userRepository.findAllUsers(filter, skip, limit);
    };

    async getUserById(userId: string) {
        const user = await userRepository.findById(userId);
        if (!user) throw new AppError("User not found", 404);
        return user;
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
    };

    async deleteUser(adminId: string, targetUserId: string) {
        if (adminId === targetUserId) throw new AppError("You cannot delete yourself", 400);

        const user = await userRepository.findById(targetUserId);
        if (!user || user.isDeleted) throw new AppError("User not found", 404);

        user.isDeleted = true;
        await user.save();

        return { message: "User delete successfully" };
    };

    async toggleUserLock(adminId: string, targetUserId: string) {
        if (adminId === targetUserId) throw new AppError("You cannot lock yourself", 400);

        const user = await userRepository.findById(targetUserId);
        if (!user || user.isDeleted) throw new AppError("User not found", 404);

        user.isLocked = !user.isLocked;
        await user.save();

        return { 
            message: user.isLocked ? "User locked" : "User unlocked", 
            isLocked: user.isLocked 
        };
    };

    async changeUserRole(
        adminId: string, 
        targetUserId: string, 
        newRole: UserRole
    ) {
        if (adminId === targetUserId) throw new AppError("You cannot change your own role", 400);
        
        if (!Object.values(UserRole).includes(newRole)) {
            throw new AppError("Invalid role", 400);
        }

        const user = await userRepository.findById(targetUserId);
        if (!user || user.isDeleted) throw new AppError("User not found", 404);

        user.role = newRole;
        await user.save();

        return { message: `User role updated to ${newRole}` };
    };

    async adminResetPassword(targetUserId: string, newPassword: string) {
        const user = await userRepository.findById(targetUserId);
        if (!user || user.isDeleted) throw new AppError("User not found", 404);

        if (!newPassword || newPassword.length < 8) {
            throw new AppError("Password must be at least 8 characters", 400);
        }

        user.password = newPassword;
        await user.save();

        return { message: "Password reset successfully by Admin" };
    };
}

export const userService = new UserService();
