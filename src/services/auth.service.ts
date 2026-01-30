import User, { IUser, UserRole, IUserCreateInput } from "../models/user.model.js";
import { Profile } from "passport-google-oauth20";
import { nanoid } from "../utils/nanoid.js";
import { AppError } from "../errors/AppError.js";


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
    }
}

export const authService = new AuthService();