import type { IUser } from "../../modules/user/user.model.js"; 

declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      user?: IUser;
    }
  }
}

export {};