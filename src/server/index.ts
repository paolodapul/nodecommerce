import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import {
  errorHandler,
  corsMiddleware as cors,
  jwtVerification,
} from "../middleware";
import routes from "../routes";

function createApp(ENV: string) {
  const app: Express = express();

  app.use(helmet());
  app.use(cors);
  app.use(express.json());

  app.get("/", (req: Request, res: Response) => {
    res.send(`Welcome to Nodecommerce - ${ENV}`);
  });

  app.use("/api", jwtVerification);
  app.use("/api", routes);
  app.use(errorHandler);

  return app;
}

export { createApp };
