import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../logger.js";

dotenv.config();

const mongoDbInit = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => logger.info("MongoDB connected"))
    .catch((err) => {
      logger.error("Error connecting to MongoDB", err);
      process.exit(1);
    });
};

export default mongoDbInit;
