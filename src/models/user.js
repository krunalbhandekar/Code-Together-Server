import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String, select: false },
    otp: { type: String },
    otpExpiredAt: { type: Number },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", function save(next) {
  if (
    (typeof this.isNew !== "undefined" && this.isNew) ||
    this.isModified("password")
  ) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return next(err);
      }
      bcrypt.hash(this.password, salt, (hashErr, hash) => {
        if (hashErr) {
          return next(hashErr);
        }
        this.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

export default mongoose.model("User", UserSchema);
