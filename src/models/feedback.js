import mongoose from "mongoose";

const { Schema } = mongoose;

const FeedbackSchema = new Schema(
  {
    content: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Feedback", FeedbackSchema);
