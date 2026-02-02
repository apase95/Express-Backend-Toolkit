import User, { IUser, IUserCreateInput } from "../user/user.model.js";
import { BaseRepository, Filter } from "../../core/database/base.repository.js";


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
};

export const authRepository = new AuthRepository();