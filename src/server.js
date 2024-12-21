import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import bodyParser from "body-parser";
import logger from "./utils/logger.js";
import mongoDbInit from "./utils/services/mongodb.js";
import routerInit from "./router.js";
import { socketInit } from "./utils/services/socket.js";

dotenv.config();

// Initialize the MongoDB connection
mongoDbInit();

const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(
  cors({
    origin: process.env.REACT_APP_URL, // Client origin
    credentials: true, // Allow cookies
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize the routes
routerInit(app);

const server = http.createServer(app);

// Initialize the Socket.io connection
socketInit(server);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
