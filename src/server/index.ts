import express, { Express } from "express";
import helmet from "helmet";
import { corsMiddleware as cors } from "../middleware";
import errorHandler from "../middleware/error-handler";
import routes from "../routes";
import { httpLogger } from "../middleware/http-logger";

function createApp() {
  const app: Express = express();

  app.use(httpLogger);
  app.use(helmet());
  app.use(cors);
  app.use("/", routes);
  app.use(errorHandler);

  return app;
}

export { createApp };
