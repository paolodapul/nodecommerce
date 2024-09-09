import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import { corsMiddleware as cors, jwtVerification } from "../middleware";
import errorHandler from "../middleware/error-handler";
import publicRoutes from "../routes/public";
import privateRoutes from "../routes/private";

function createApp(ENV: string) {
  const app: Express = express();

  app.use(helmet());
  app.use(cors);
  app.use(express.json());

  app.get("/", (req: Request, res: Response) => {
    res.send(`Welcome to Nodecommerce - ${ENV}`);
  });

  app.use("/api", publicRoutes);
  app.use("/api", jwtVerification);
  app.use("/api", privateRoutes);
  app.use(errorHandler);

  return app;
}

export { createApp };
