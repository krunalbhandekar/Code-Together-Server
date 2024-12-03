import mongoose from "mongoose";

const init = (cb) => {
  const MONGO_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.1cygt.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
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
