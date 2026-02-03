import User, { IUser, UserRole, IUserCreateInput } from "../user/user.model.js";
import { Profile as GoogleProfile } from "passport-google-oauth20";
import { Profile as LinkedInProfile } from "passport-linkedin-oauth2";
import { nanoid } from "../../core/utils/nanoid.js";
import { AppError } from "../../core/errors/AppError.js";
import { signAccessToken, signRefreshToken, verifyToken } from "../../core/security/jwt.js";
import { authRepository } from "./auth.repository.js";
import { config } from "../../core/config/index.config.js"; 
import { userRepository } from "../user/user.repository.js";
import { emailService } from "../../core/mail/mail.service.js";


interface NormalizedProfile {
    providerId: string;
    email: string;
    displayName: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
};

class AuthService {

    async login(data: Pick<IUserCreateInput, "email" | "password">){
        const { email, password } = data;
        const user = await authRepository.findByEmailWithPassword(email);
        if (!user || !password) throw new AppError("Invalid email or password", 401);

        const isValid = await user.checkPassword(password);
        if (!isValid) throw new AppError("Invalid email or password", 401);

        const tokens = await this.generateTokens(user);
        return { user, ...tokens };
    };

    async refreshToken(token: string){
        const decoded = verifyToken(token, true);
        
        const user = await authRepository.findById(decoded.userId);
        if (!user) throw new AppError("User not found", 404);

        return await this.generateTokens(user); 
    };

    async generateTokens(user: IUser) {
        const payload = { userId: user._id.toString(), role: user.role };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        return { accessToken, refreshToken };
    };

    async register(data: IUserCreateInput) {
        const existingUser = await authRepository.findByEmail(data.email);
        if (existingUser) throw new AppError("Email already exists", 409);

        const newUser = await User.create(data as any);
        await this.sendVerificationEmail(newUser);
        
        return newUser;
    };


    private async handleOAuthUser(
        data: NormalizedProfile, 
        provider: "google" | "linkedin"
    ): Promise<IUser> {
        
        if (!data.email) {
            throw new AppError(`${provider} account does not have an email`, 400);
        }

        let user = await authRepository.findByEmail(data.email);
        if (user) {
            if (provider === "google" && !user.googleId) {
                user.googleId = data.providerId;
                user.avatarURL = user.avatarURL || data.avatarUrl;
                await user.save();
            } else if (provider === "linkedin" && !user.linkedinId) {
                user.linkedinId = data.providerId;
                user.avatarURL = user.avatarURL || data.avatarUrl;
                await user.save();
            }
            return user;
        }

        const randomPassword = nanoid(16);
        const payload: IUserCreateInput = {
            email: data.email,
            displayName: data.displayName,
            firstName: data.firstName,
            lastName: data.lastName,
            avatarURL: data.avatarUrl,
            password: randomPassword,
            role: UserRole.USER,
        };
        if (provider === "google") payload.googleId = data.providerId;
        if (provider === "linkedin") payload.linkedinId = data.providerId;
        
        const newUser = await User.create(payload as any);
        return newUser;
    };

    async findOrCreateGoogleUser(profile: GoogleProfile): Promise<IUser> {
        const normalizedData: NormalizedProfile = {
            providerId: profile.id,
            email: profile.emails?.[0]?.value || "",
            displayName: profile.displayName,
            firstName: profile.name?.givenName || "",
            lastName: profile.name?.familyName || "",
            avatarUrl: profile.photos?.[0]?.value || ""
        };

        return this.handleOAuthUser(normalizedData, "google");
    };

    async findOrCreateLinkedInUser(profile: LinkedInProfile): Promise<IUser> {
        const normalizedData: NormalizedProfile = {
            providerId: profile.id,
            email: profile.emails?.[0]?.value || "",
            displayName: profile.displayName,
            firstName: profile.name?.givenName || "",
            lastName: profile.name?.familyName || "",
            avatarUrl: profile.photos?.[0]?.value || ""
        };

        return this.handleOAuthUser(normalizedData, "linkedin");
    };

    async sendVerificationEmail(user: IUser){
        const token = nanoid(32);
        await authRepository.createVerificationToken(user._id.toString(), token);
        
        const verifyLink = `${config.app.clientUrl}/verify-email?token=${token}`;
        await emailService.sendEmail(
            user.email,
            "Verify your email",
            `<p>Click <a href="${verifyLink}">here</a> to verify your email.</p>`
        );
    };

    async verifyEmail(token: string){
        const record = await authRepository.findVerificationToken(token);
        if (!record) throw new AppError("User not found", 404);

        const user = await userRepository.findById(record.userId.toString());
        if (!user) throw new AppError("User not found", 404);
        if (user.isEmailVerified) throw new AppError("Email already verified", 400);

        user.isEmailVerified = true;
        await user.save();
        await authRepository.deleteVerificationToken(record._id.toString());
        return { message: "Email verified successfully" };
    };

    async forgotPassword(email: string){
        const user = await userRepository.findByEmail(email);
        if (!user) return;
        if (user.googleId || user.linkedinId) throw new AppError("Social cannot reset password", 400);

        await authRepository.deleteExistingResetToken(user._id.toString());
    
        const token = nanoid(32);
        await authRepository.createPasswordResetToken(user._id.toString(), token);
        
        const resetLink = `${config.app.clientUrl}/reset-password?token=${token}`;
        await emailService.sendEmail(
            user.email,
            "Reset your password",
            `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.</p>`
        );
    };

    async resetPassword(token: string, newPassword: string){
        const record = await authRepository.findPasswordResetToken(token);
        if (!record) throw new AppError("Invalid or expired reset token", 400);

        const user = await userRepository.findByIdWithPassword(record.userId.toString());
        if (!user) throw new AppError("User not found", 404);

        user.password = newPassword;
        await user.save();

        await authRepository.deletePasswordResetToken(record._id.toString());
        await emailService.sendEmail(
            user.email,
            "Password Reset Success", "<p>Your password has been changed.</p>"
        );

        return { message: "Password reset successfully" };
    };
}

export const authService = new AuthService();


