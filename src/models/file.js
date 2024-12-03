import DB from "../utils/services/mongodb.js";

const mongoose = DB.getInstance();
const { Schema } = mongoose;

const FileSchema = new Schema(
  {
    name: { type: String },
    language: { type: String },
    content: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("File", FileSchema);
