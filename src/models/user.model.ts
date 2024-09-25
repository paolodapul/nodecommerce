import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller';
  stripePaymentMethodId?: string;
  stripeCustomerId?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['buyer', 'seller'],
      default: 'buyer',
    },
    stripePaymentMethodId: {
      type: String,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getSignedJwtToken = function (): string {
  return jwt.sign({ id: this._id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const UserModel: Model<IUser> = mongoose.model<IUser>(
  'User',
  userSchema,
);
