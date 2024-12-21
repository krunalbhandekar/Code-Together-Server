import mongoose from "mongoose";

const { Schema } = mongoose;

const GeminiSchema = new Schema(
  {
    file: { type: Schema.Types.ObjectId, ref: "File" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    prompt: { type: String },
    response: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Gemini", GeminiSchema);
