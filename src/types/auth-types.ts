import { Types } from "mongoose";
import { Request } from "express";

export interface TokenBody {
  _id: Types.ObjectId;
  roles: Types.ObjectId[];
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}
