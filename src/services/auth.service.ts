import User, { IUser, UserRole, IUserCreateInput } from "../models/user.model.js";
import { Profile as GoogleProfile } from "passport-google-oauth20";
import { Profile as LinkedInProfile } from "passport-linkedin-oauth2";
import { nanoid } from "../utils/nanoid.js";
import { AppError } from "../errors/AppError.js";
import { signAccessToken, signRefreshToken, verifyToken } from "../security/jwt.js";


interface NormalizedProfile {
    providerId: string;
    email: string;
    displayName: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
}

class AuthService {

    async login(data: Pick<IUserCreateInput, "email" | "password">){
        const { email, password } = data;
        const user = await User.findOne({ email }).select("+hashedPassword");
        if (!user || !password) throw new AppError("Invalid email or password", 401);

        const isValid = await user.checkPassword(password);
        if (!isValid) throw new AppError("Invalid email or password", 401);

        const tokens = await this.generateTokens(user);
        return { user, ...tokens };
    };

    async refreshToken(token: string){
        const decoded = verifyToken(token, true);
        
        const user = await User.findById(decoded.userId);
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
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) throw new AppError("Email already exists", 409);

        const newUser = await User.create(data as any);
        return newUser;
    };


    private async handleOAuthUser(
        data: NormalizedProfile, 
        provider: "google" | "linkedin"
    ): Promise<IUser> {
        
        if (!data.email) {
            throw new AppError(`${provider} account does not have an email`, 400);
        }

        let user = await User.findOne({ email: data.email });
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
            googleId: provider === "google" ? data.providerId : undefined,
            linkedinId: provider === "linkedin" ? data.providerId : undefined,
        };

        const newUser = await User.create(payload as any);
        return newUser;
    }

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
}

export const authService = new AuthService();


