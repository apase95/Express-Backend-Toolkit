import User, { IUser, IUserCreateInput } from "../models/user.model.js";
import { BaseRepository } from "./base.repository.js";


class AuthRepository extends BaseRepository<IUser>{
    
    constructor() {
        super(User);
    };

    findByEmail(email: string) {
        return this.model.findOne({ email });
    };

    findByEmailWithPassword(email: string) {
        return this.model
            .findOne({ email })
            .select("+hashedPassword");
    };

    findById(id: string) {
        return this.model.findById(id);
    };

    findByIdWithPassword(id: string) {
        return this.model
            .findOne({ id })
            .select("+hashedPassword");
    };

    createUser(data: IUserCreateInput) {
        return this.model.create(data);
    };

    findByGoogleId(googleId: string) {
        return this.model.findOne({ googleId });
    };

    findByLinkedInId(linkedinId: string) {
        return this.model.findOne({ linkedinId });
    };

    findByEmailOrProviderId(email: string) {
        return this.model.findOne({ email });
    };
};

export const authRepository = new AuthRepository();