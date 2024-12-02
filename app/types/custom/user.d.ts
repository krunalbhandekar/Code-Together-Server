import { ObjectId } from "mongoose";

interface IUser {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  otp: string;
  otpExpiredAt: number;
  isVerified: boolean;
}

interface IJwtPayload {
  userId: ObjectId;
}
