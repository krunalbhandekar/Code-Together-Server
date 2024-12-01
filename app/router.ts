import { Express } from "express";
import userRouter from "./routes/user.js";

const routerInit = (app: Express): void => {
  app.use("/user", userRouter);
};

export default routerInit;
