import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const init = (cb) => {
  const MONGO_URL = process.env.MONGO_URL;
  mongoose.set("strictQuery", true);
  mongoose
    .connect(MONGO_URL)
    .then(() => {
      cb();
    })
    .catch((err) => {
      cb(err);
    });
};

const getInstance = () => mongoose;
const DB = { init, getInstance };

export default DB;
