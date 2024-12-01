import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import routerInit from "./router";
import http from "http";

// Load the environment variables from .env file
const envLoaded = dotenv.config({ path: `${__dirname}/.env` });
if (envLoaded.error) {
  console.log("Unable to load .env file, please check.");
  process.exit();
}

// Initialize the express
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // Frontend origin
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
