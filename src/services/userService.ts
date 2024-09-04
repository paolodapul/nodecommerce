import { User } from "../models/userModel";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "../utils/hashing";

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
    token: jwt.sign(
      { id: user?._id, role: user?.roles[0] },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    ),
  };
};

export { register, login };
