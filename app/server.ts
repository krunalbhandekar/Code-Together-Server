import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import http from "http";
import bodyParser from "body-parser";
import DB from "./utils/services/mongodb";
import routerInit from "./router";

// Load the environment variables from .env file
const envLoaded = dotenv.config({ path: `${__dirname}/.env` });
if (envLoaded.error) {
  console.log("Unable to load .env file, please check.");
  process.exit();
}

// Initialize the Mongo DB connection
DB.init((err: unknown) => {
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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Initialize the routes
routerInit(app);

// Server is created
const server = new http.Server(app);

export default server;
