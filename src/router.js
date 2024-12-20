import userRouter from "./routes/user.js";
import fileRouter from "./routes/file.js";
import invitationRouter from "./routes/invitation.js";
import authorization from "./utils/middleware/authorization.js";

const routerInit = (app) => {
  app.get("/", async (_, res) => {
    res.send({
      status: "success",
      message: "This is the server of Code Together project",
      author: "Krunal Bhandekar",
    });
  });
  app.use("/user", userRouter);
  app.use("/file", authorization, fileRouter);
  app.use("/invitation", authorization, invitationRouter);
};

export default routerInit;
