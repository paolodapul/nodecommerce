import { Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  roles: Types.ObjectId[];
  createdAt: Date;
}
