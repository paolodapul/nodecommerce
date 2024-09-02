import { IncomingMessage, Server, ServerResponse } from "http";
import { createApp } from "./server";
import dotenv from "dotenv";
import { connectMongoDB, disconnectMongoDB } from "./config/database";

const ENV = process.env.NODE_ENV ?? "development";
dotenv.config({ path: `.env.${ENV}` });

const port = process.env.PORT ?? 3000;
const app = createApp(ENV);

void (async () => await connectMongoDB())();

const server = app.listen(port, () => {
  console.log(
    `[server]: Server is running at http://localhost:${port as string}`
  );
});

async function gracefulShutdown(
  signal: string,
  server: Server<typeof IncomingMessage, typeof ServerResponse>,
  disconnectDB: () => Promise<void>
) {
  console.log(`Received ${signal}. Closing HTTP server.`);
  server.close(() => {
    console.log("HTTP server closed");
  });

  await disconnectDB();
  console.log("Process terminated");
  process.exit(0);
}

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT", server, disconnectMongoDB);
});
process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM", server, disconnectMongoDB);
});
