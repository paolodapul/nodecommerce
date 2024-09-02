import { User } from "../models/userModel";
import bcrypt from "bcryptjs";
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

export { register };
