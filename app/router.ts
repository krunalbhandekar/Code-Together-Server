import { Express } from "express";
import userRouter from "./routes/user.js";
import fileRouter from "./routes/file.js";
import authorization from "./utils/middleware/authorization.js";

const routerInit = (app: Express): void => {
  app.use("/user", userRouter);
  app.use("/file", authorization, fileRouter);
};

export default routerInit;
