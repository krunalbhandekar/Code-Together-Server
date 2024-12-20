import mongoose from "mongoose";

const { Schema } = mongoose;

const InvitationSchema = new Schema(
  {
    file: { type: Schema.Types.ObjectId, ref: "File" },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    receiver: { type: Schema.Types.ObjectId, ref: "User" },
    receiverEmail: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Invitation", InvitationSchema);
