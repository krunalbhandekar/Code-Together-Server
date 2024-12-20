import userRouter from "./routes/user.js";

const routerInit = (app) => {
  app.get("/", async (_, res) => {
    res.send({ status: "success" });
  });
  app.use("/user", userRouter);
};

export default routerInit;
