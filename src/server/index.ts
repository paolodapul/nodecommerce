import express, { Express } from "express";
import helmet from "helmet";
import { corsMiddleware as cors } from "../middleware";
import errorHandler from "../middleware/error-handler";
import routes from "../routes";
import indexRoutes from "../routes/index-routes";
import { httpLogger } from "../middleware/http-logger";
import webhookRoutes from "../routes/webhook-routes";

function createApp() {
  const app: Express = express();

  app.use(httpLogger);
  app.use(helmet());
  app.use(cors);
  app.use("/", webhookRoutes);
  app.use(express.json());
  app.use("/", indexRoutes);
  app.use("/api", routes);
  app.use(errorHandler);

  return app;
}

export { createApp };
