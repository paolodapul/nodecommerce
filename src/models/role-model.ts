import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  permissions: [
    {
      type: String,
      required: true,
    },
  ],
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Role = mongoose.model("Role", roleSchema);

export { Role };
