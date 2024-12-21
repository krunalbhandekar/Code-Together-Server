import HttpStatus from "http-status";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
import fileRouter from "./routes/file.js";
import invitationRouter from "./routes/invitation.js";
import geminiRouter from "./routes/invitation.js";
import feedbackRouter from "./routes/feedback.js";
import authorization from "./utils/middleware/authorization.js";

dotenv.config();

const routerInit = (app) => {
  app.get("/", async (_, res) => {
    res.status(HttpStatus.OK).send({
      status: "success",
      name: "Code-Together-Server",
      version: "0.0.1",
      description: "This is the server of code together project",
      client: process.env.REACT_APP_URL,
      author: {
        name: "Krunal Bhandekar",
        designation: "Full Stack Web Developer",
        email: "krunalbhandekar10@gmail.com",
      },
    });
  });
  app.use("/user", userRouter);
  app.use("/file", authorization, fileRouter);
  app.use("/invitation", authorization, invitationRouter);
  app.use("/gemini", authorization, geminiRouter);
  app.use("/feedback", authorization, feedbackRouter);
};

export default routerInit;
