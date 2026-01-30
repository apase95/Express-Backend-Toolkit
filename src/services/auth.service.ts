import User, { IUser, UserRole, IUserCreateInput } from "../models/user.model.js";
import { Profile } from "passport-google-oauth20";
import { nanoid } from "../utils/nanoid.js";
import { AppError } from "../errors/AppError.js";
import { signAccessToken, signRefreshToken, verifyToken } from "../security/jwt.js";


class AuthService {

    async findOrCreateGoogleUser(profile: Profile): Promise<IUser> {
        const email = profile.emails?.[0]?.value;
        if (!email) {
            throw new AppError("Google account does not have an email", 400);
        }

        let user = await User.findOne({ email });        
        const avatarUrl = profile.photos?.[0]?.value ?? ""; 
        if (user) {
            if (!user.googleId) {
                user.googleId = profile.id;
                user.avatarURL = user.avatarURL || avatarUrl;
                await user.save();
            }
            return user;
        }

        const randomPassword = nanoid(16);
        const payload: IUserCreateInput = {
            email: email,
            displayName: profile.displayName,
            firstName: profile.name?.givenName ?? "", 
            lastName: profile.name?.familyName ?? "",
            googleId: profile.id,
            avatarURL: avatarUrl,            
            password: randomPassword, 
            role: UserRole.USER,
        };

        const newUser = await User.create(payload);
        return newUser;
    };

    async register(data: IUserCreateInput) {
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) throw new AppError("Email already exists", 409);

        const newUser = await User.create(data);
        newUser.hashedPassword = null;
        return newUser;
    };

    async login(data: Pick<IUserCreateInput, "email" | "password">){
        const { email, password } = data;
        const user = await User.findOne({ email }).select("+hashedPassword");
        if (!user || !password) throw new AppError("Invalid email or password", 401);

        const isValid = await user.checkPassword(password);
        if (!isValid) throw new AppError("Invalid email or password", 401);

        const tokens = this.generateTokens(user);
        return { user, ...tokens };
    };

    async refreshToken(token: string){
        const decoded = verifyToken(token, true);
        
        const user = await User.findById(decoded.userId);
        if (!user) throw new AppError("User not found", 404);

        return this.generateTokens(user); 
    }

    async generateTokens(user: IUser) {
        const payload = { userId: user._id.toString(), role: user.role };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        return { accessToken, refreshToken };
    }

}

export const authService = new AuthService();