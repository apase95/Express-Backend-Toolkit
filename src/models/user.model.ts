import { Schema, model, InferSchemaType, HydratedDocument, Model, Types } from "mongoose";
import { comparePassword, hashPassword } from '../security/hash.js';


export enum UserRole {
    USER = "user",
    ADMIN = "admin",
    MODERATOR = "moderator"
}

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    hashedPassword: {
        type: String,
        select: false,
    },
    displayName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    firstName: { 
        type: String, 
        default: "" 
    },
    lastName: { 
        type: String, 
        default: "" 
    },
    phoneNumber: {
        type: String,
        sparse: true
    },
    avatarURL: String,
    avatarId: String,
    googleId: { 
        type: String, 
        index: true 
    },
    linkedinId: String,
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.USER,
        required: true 
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
});

export type UserRaw = InferSchemaType<typeof userSchema>;

export interface IUserMethods {
    checkPassword(candidate: string): Promise<boolean>;
};

export interface IUserVirtuals {
    fullName: string;
    password?: string;
    _password?: string;
};

export type IUser = HydratedDocument<
    UserRaw & { _id: Types.ObjectId },
    IUserVirtuals & IUserMethods
>;

export interface IUserCreateInput {
    email: string;
    displayName: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    avatarURL?: string;
    googleId?: string;
    role?: UserRole;
}

userSchema.virtual('fullName').get(function(this: IUser) {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

userSchema.virtual('password')
    .set(function(this: IUser, value: string) {
        this._password = value;
    })
    .get(function(this: IUser) {
        return this._password;
    });

userSchema.pre('save', async function(this: IUser) {
    if (!this.isModified('hashedPassword') && !this._password) {
        return;
    }

    if (this._password) {
        this.hashedPassword = await hashPassword(this._password);
    }
});

userSchema.method('checkPassword', async function(this: IUser, candidate: string): Promise<boolean> {
    const user = this as IUser;
    if (!user.hashedPassword) return false;
    return await comparePassword(candidate, user.hashedPassword);
});

const User = model<IUser, Model<IUser>>("User", userSchema);
export default User;