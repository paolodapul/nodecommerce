import mongoose from "mongoose";
import { initializeRoles } from "./initialize-roles";
import dotenv from "dotenv";
import { initializeUsers } from "./initialize-users";
import { initializeCategories } from "./initialize-categories";
import { initializeProducts } from "./initialize-products";

const ENV = process.env.NODE_ENV ?? "development";
dotenv.config({ path: `.env.${ENV}` });

const MONGO_URI = process.env.MONGO_URI;

async function runSeeders() {
  try {
    await mongoose.connect(MONGO_URI as string);
    console.log("Connected to MongoDB");
    await initializeRoles();
    await initializeUsers();
    await initializeCategories();
    await initializeProducts();
    console.log("All seeders completed successfully");
  } catch (error) {
    console.error("Error running seeders:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Check if this script is being run directly (not imported)
if (require.main === module) {
  void runSeeders();
}

export default runSeeders;
