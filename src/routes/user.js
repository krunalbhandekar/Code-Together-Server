import express from "express";
import jsonwebtoken from "jsonwebtoken";
import HttpStatus from "http-status";
import User from "../models/user.js";
import Status from "../utils/enums/status.js";
import UserHook from "../utils/hooks/user.js";
import generateOtp from "../utils/helper/generateOtp.js";
import ErrorMessages from "../utils/enums/error-messages.js";
import comparePassword from "../utils/helper/comparePassword.js";
import sendEmailNotification from "../utils/services/nodemailer.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
      return;
    }

    const otp = generateOtp();

    const user = existingUser || new User({ name, email });

    user.password = password;
    user.otp = otp;
    user.otpExpiredAt = Date.now() + 5 * 60 * 100; // Otp expires in 5 minute
    await user.save();

    UserHook.afterCreate(user._id);

    await sendEmailNotification({ to: user.email, subject: "Otp", text: otp });

    res.status(HttpStatus.OK).send({ status: Status.SUCCESS });
  } catch (err) {
    if (err instanceof Error) {
      console.log("[registerUser]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
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
  } catch (err) {
    if (err instanceof Error) {
      console.log("[verifyOtp]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.isVerified) {
      res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "User not found." });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "Invalid credential" });
      return;
    }

    const payload = { userId: user._id };
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
  } catch (err) {
    if (err instanceof Error) {
      console.log("[loginUser]", err.message);
    }
    res
      .status(HttpStatus.OK)
      .send({ status: Status.ERROR, error: ErrorMessages.E1003 });
  }
});

export default router;
