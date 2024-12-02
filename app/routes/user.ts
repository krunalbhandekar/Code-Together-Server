import express, { Request, Response } from "express";
import mongoose from "mongoose";
import HttpStatus from "http-status";
import jsonwebtoken from "jsonwebtoken";
import Status from "../types/enums/status";
import { IJwtPayload, IUser } from "../types/custom/user";
import ErrorMessages from "../types/enums/error-messages";
import User from "../models/user";
import UserHook from "../utils/hooks/user";
import generateOtp from "../utils/helper/generateOtp";
import comparePassword from "../utils/helper/comparePassword";
import sendEmailNotification from "../utils/services/nodemailer";

const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    type userType = IUser & mongoose.Document;
    const existingUser: userType | null = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
      return;
    }

    const otp: string = generateOtp();

    const user = existingUser || new User({ name, email });

    user.password = password;
    user.otp = otp;
    user.otpExpiredAt = Date.now() + 5 * 60 * 100; // Otp expires in 5 minute
    await user.save();

    UserHook.afterCreate(user._id);

    await sendEmailNotification({ to: user.email, subject: "Otp", text: otp });

    res.status(HttpStatus.OK).send({ status: Status.SUCCESS });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log("[registerUser]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
  }
});

router.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    type userType = IUser & mongoose.Document;
    const user: userType | null = await User.findOne({ email });
    if (!user) {
      res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "User not found." });
      return;
    } else if (user.otpExpiredAt < Date.now()) {
      res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "Otp has been expired." });
      return;
    } else if (user.otp !== otp) {
      res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "Invalid Otp." });
      return;
    }

    user.isVerified = true;
    user.otp = "";
    user.otpExpiredAt = 0;
    await user.save();

    res.status(HttpStatus.OK).send({ status: Status.SUCCESS });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log("[verifyOtp]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user: IUser | null = await User.findOne({ email });
    if (!user || !user.isVerified) {
      res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "User not found." });
      return;
    }

    const isMatch: boolean = await comparePassword(password, user.password);
    if (!isMatch) {
      res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "Invalid credential" });
      return;
    }

    const payload: IJwtPayload = { userId: user._id };
    const token = jsonwebtoken.sign(
      payload,
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    res.status(HttpStatus.OK).send({
      status: Status.SUCCESS,
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log("[loginUser]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
  }
});

export default router;
