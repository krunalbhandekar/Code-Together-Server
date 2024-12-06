import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import http from "http";
import bodyParser from "body-parser";
import DB from "./utils/services/mongodb.js";
import httpStatus from "http-status";
import routerInit from "./router.js";
import { socketInit } from "./utils/services/socket.js";

if (process.env.NODE_ENV !== "prod") {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const fixedDirname = __dirname.startsWith("/")
    ? __dirname.slice(1)
    : __dirname;
  const envPath = path.join(fixedDirname, ".env");

  const envLoaded = dotenv.config({ path: envPath });
  if (envLoaded.error) {
    console.log("Unable to load .env file, please check.");
    process.exit();
  } else {
    console.log("Environment loaded successfully:");
  }
}

// Initialize the Mongo DB connection
DB.init((err) => {
  if (err instanceof Error) {
    console.log("Error connectiong to database", err);
    process.exit();
  }
});

// Initialize the express
const app = express();

app.use(
  cors({
    origin: process.env.REACT_APP_URL, // Frontend origin
    credentials: true, // Allow cookies
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (_, res) => {
  res.status(httpStatus.OK).send({ status: "success", message: "done" });
});

// Initialize the routes
routerInit(app);

// Server is created
const server = new http.Server(app);

// Initialize the Socket.io
socketInit(server);

const port = process.env.SERVER_PORT;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
