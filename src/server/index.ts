import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import { errorHandler, corsMiddleware as cors } from "../middleware";

function createApp(ENV: string) {
  const app: Express = express();

  app.use(helmet());
  app.use(cors);
  app.use(errorHandler);

  app.get("/", (req: Request, res: Response) => {
    res.send(`Welcome to Nodecommerce - ${ENV}`);
  });

  return app;
}

export { createApp };
