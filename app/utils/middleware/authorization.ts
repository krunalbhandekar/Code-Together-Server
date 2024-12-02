import { NextFunction, Request, Response } from "express";
import HttpStatus from "http-status";
import Status from "../../types/enums/status";
import jsonwebtoken from "jsonwebtoken";
import User from "../../models/user";
import { IJwtPayload } from "../../types/custom/user";

const authorization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization;
  if (!token) {
    res
      .status(HttpStatus.OK)
      .send({ status: Status.UNAUTHORIZED, error: "Unauthorized" });
    return;
  }
  try {
    const decoded = jsonwebtoken.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as IJwtPayload;
    const user = await User.findOne({ _id: decoded.userId });
    if (user) {
      req.user = user;
    }
    next();
  } catch (err) {
    res
      .status(HttpStatus.OK)
      .send({ status: Status.UNAUTHORIZED, error: "Invalid token" });
  }
};

export default authorization;
