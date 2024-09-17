import bcrypt from "bcryptjs";
import logger from "./logger";

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    logger.error("Error hashing password:", error);
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
    logger.error("Error comparing passwords:", error);
    throw error;
  }
}

export { hashPassword, verifyPassword };
