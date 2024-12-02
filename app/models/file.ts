import DB from "../utils/services/mongodb";
import { IFile } from "../types/custom/file";

const mongoose = DB.getInstance();
const { Schema } = mongoose;

const FileSchema = new Schema<IFile>(
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

export default mongoose.model<IFile>("File", FileSchema);
