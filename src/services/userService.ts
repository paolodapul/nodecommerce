import { User } from "../models/userModel";

type UserData = {
  username: string;
  email: string;
  password: string;
};

const register = async (userData: UserData) => {
  const { username, email, password } = userData;
  const newUser = new User({ username, email, password });
  await newUser.save();
  return newUser;
};

export { register };
