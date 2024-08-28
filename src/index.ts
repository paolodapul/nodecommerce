import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

const ENV = process.env.NODE_ENV ?? "development";

dotenv.config({ path: `.env.${ENV}` });

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to Nodecommerce - ${ENV}`);
});

app.listen(port, () => {
  console.log(
    `[server]: Server is running at http://localhost:${port as string}`
  );
});
