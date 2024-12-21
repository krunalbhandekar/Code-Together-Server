import express from "express";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import HttpStatus from "http-status";
import User from "../models/user.js";
import Status from "../utils/enums/status.js";
import ErrorMessages from "../utils/enums/error-messages.js";
import generateOtp from "../utils/helper/generateOtp.js";
import UserHook from "../utils/hooks/user.js";
import logger from "../utils/logger.js";
import comparePassword from "../utils/helper/comparePassword.js";
import sendEmailNotification from "../utils/services/nodemailser.js";

dotenv.config();

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "Email already exists" });
    }

    const otp = generateOtp();

    const user = existingUser || new User({ name, email });
    user.password = password;
    user.otp = otp;
    user.otpExpiredAt = Date.now() + 5 * 60 * 100; // Otp expires in 5 minute
    await user.save();

    UserHook.afterCreate(user._id);

    await sendEmailNotification({ to: user.email, subject: "OTP", text: otp });

    res.status(HttpStatus.OK).send({ status: Status.SUCCESS });
  } catch (err) {
    if (err instanceof Error) {
      logger.error("[register-user]", err.message);
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
      return res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "User not found" });
    } else if (user.otpExpiredAt < Date.now()) {
      return res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "Otp has been expired." });
    } else if (user.otp !== otp) {
      return res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "Invalid Otp." });
    }

    user.isVerified = true;
    user.otp = "";
    user.otpExpiredAt = 0;
    await user.save();

    res.status(HttpStatus.OK).send({ status: Status.SUCCESS });
  } catch (err) {
    if (err instanceof Error) {
      logger.error("[verify-otp]", err.message);
    }
    res.status(HttpStatus.OK).send({
      status: Status.ERROR,
      error: "OTP verification failed. Please try again.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.isVerified) {
      return res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "User not found." });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res
        .status(HttpStatus.OK)
        .send({ status: Status.ERROR, error: "Invalid password" });
    }

    const payload = { userId: user._id };
    const token = jsonwebtoken.sign(
      payload,
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "24h",
      }
    );

    res.status(HttpStatus.OK).send({
      status: Status.SUCCESS,
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    if (err instanceof Error) {
      logger.error("[login-user]", err.message);
    }
    res.status(HttpStatus.OK).send({
      status: Status.ERROR,
      error: "Login failed. Please try again.",
    });
  }
});

export default router;
