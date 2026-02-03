import User, { IUser, IUserCreateInput } from "../user/user.model.js";
import { BaseRepository, Filter } from "../../core/database/base.repository.js";
import EmailVerification, { IEmailVerification } from "./email-verification.model.js";
import PasswordReset, { IPasswordReset } from "./password-reset.model.js";


class AuthRepository extends BaseRepository<IUser>{
    
    constructor() {
        super(User);
    };

    findByEmail(email: string): Promise<IUser | null> {
        return this.findOne({ email } as Filter<IUser>);
    };

    findByEmailWithPassword(email: string): Promise<IUser | null> {
        return this.model
            .findOne({ email })
            .select("+hashedPassword")
            .exec();
    };

    createUser(data: IUserCreateInput): Promise<IUser | null> {
        return this.create(data as any);
    };

    findByGoogleId(googleId: string): Promise<IUser | null> {
        return this.findOne({ googleId } as Filter<IUser>);
    };

    findByLinkedInId(linkedinId: string): Promise<IUser | null> {
        return this.findOne({ linkedinId } as Filter<IUser>);
    };

    async createVerificationToken(userId: string, token: string) {
        return EmailVerification.create({ userId, token });
    };

    async findVerificationToken(token: string): Promise<IEmailVerification | null> {
        return EmailVerification.findOne({ token }).exec();
    };

    async deleteVerificationToken(id: string) {
        return EmailVerification.findByIdAndDelete(id).exec();
    };

    async createPasswordResetToken(userId: string, token: string) {
        return PasswordReset.create({ userId, token });
    };

    async findPasswordResetToken(token: string): Promise<IPasswordReset | null> {
        return PasswordReset.findOne({ token }).exec();
    };

    async deletePasswordResetToken(id: string) {
        return PasswordReset.findByIdAndDelete(id).exec();
    };
    
    async deleteExistingResetToken(userId: string) {
        return PasswordReset.findOneAndDelete({ userId }).exec();
    };
};

export const authRepository = new AuthRepository();