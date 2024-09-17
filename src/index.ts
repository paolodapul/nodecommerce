import { IncomingMessage, Server, ServerResponse } from "http";
import { createApp } from "./server";
import dotenv from "dotenv";
import { connectMongoDB, disconnectMongoDB } from "./config/database";
import logger from "./utils/logger";

const ENV = process.env.NODE_ENV ?? "development";
dotenv.config({ path: `.env.${ENV}` });

const port = process.env.PORT ?? 3000;
const app = createApp();

void (async () => await connectMongoDB())();

const server = app.listen(port as number, "0.0.0.0", () => {
  logger.info(`Server is running at http://0.0.0.0:${port as string}`);
});

async function gracefulShutdown(
  signal: string,
  server: Server<typeof IncomingMessage, typeof ServerResponse>,
  disconnectDB: () => Promise<void>
) {
  logger.info(`Received ${signal}. Closing HTTP server.`);
  server.close(() => {
    logger.info("HTTP server closed");
  });

  await disconnectDB();
  logger.info("Process terminated");
  process.exit(0);
}

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT", server, disconnectMongoDB);
});
process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM", server, disconnectMongoDB);
});
