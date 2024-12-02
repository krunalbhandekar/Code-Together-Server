import { IUser } from "../custom/user";

declare module "express-serve-static-core" {
  interface Request {
    user: IUser;
  }
}

export {};
