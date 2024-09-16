import { Types } from "mongoose";

export interface TokenBody {
  _id: Types.ObjectId;
  roles: Types.ObjectId[];
}
