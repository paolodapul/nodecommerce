import { model, Schema } from "mongoose";
import { VALID_PERMISSIONS, Permission, IRole } from "../types/role-types";

const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  permissions: {
    type: [String],
    enum: VALID_PERMISSIONS,
    required: true,
    validate: [
      {
        validator: (array: Permission[]) => array.length > 0,
        message: "At least one permission is required.",
      },
      {
        validator: (array: Permission[]) =>
          array.every((v) => VALID_PERMISSIONS.includes(v)),
        message: "Invalid permission value.",
      },
    ],
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Role = model<IRole>("Role", roleSchema);

export { Role };
