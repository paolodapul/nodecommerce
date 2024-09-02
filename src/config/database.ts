import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected successfully");
  } catch (error) {
    console.error("MongoDB disconnection error:", error);
    process.exit(1);
  }
};

export { connectMongoDB, disconnectMongoDB };
