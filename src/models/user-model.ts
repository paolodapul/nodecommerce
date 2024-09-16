import { Schema, model } from "mongoose";
import { IUser } from "../types/user-types";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: [
    {
      type: Schema.Types.ObjectId,
      ref: "Role",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = model<IUser>("User", userSchema);

export { User };
