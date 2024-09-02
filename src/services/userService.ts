import { User } from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
}

async function verifyPassword(
  plainTextPassword: string,
  hashedPassword: string
) {
  try {
    const match = await bcrypt.compare(plainTextPassword, hashedPassword);
    return match;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error;
  }
}

type UserData = {
  username: string;
  email: string;
  password: string;
};

const register = async (userData: UserData) => {
  const { username, email, password } = userData;
  const newUser = new User({
    username,
    email,
    password: await hashPassword(password),
  });
  await newUser.save();
  return newUser;
};

const login = async (userData: UserData) => {
  const { username, password } = userData;
  let userFound, matchesPassword;

  const user = await User.findOne({ username });

  if (user) {
    userFound = true;
    matchesPassword = await verifyPassword(password, user.password);
  }

  if (!userFound || !matchesPassword) {
    throw new Error("Incorrect username or password.");
  }

  return {
    username: user?.username,
    token: jwt.sign({ id: user?._id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    }),
  };
};

export { register, login };
