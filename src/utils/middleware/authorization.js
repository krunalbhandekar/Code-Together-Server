import HttpStatus from "http-status";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../../models/user.js";
import Status from "../enums/status.js";

dotenv.config();

const authorization = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .Status(HttpStatus.OK)
      .send({ status: Status.UNAUTHORIZED, error: "Unauthorized" });
  }

  try {
    const decoded = jsonwebtoken.verify(
      token,
      process.env.JWT_SECRET || "secret"
    );
    const user = await User.findOne({ _id: decoded.userId });

    req.user = user;
    next();
  } catch (err) {
    res
      .status(HttpStatus.OK)
      .send({ status: Status.UNAUTHORIZED, error: "Invalid token" });
  }
};

export default authorization;
