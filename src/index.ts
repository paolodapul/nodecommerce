import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors, { CorsOptions } from "cors";

const ENV = process.env.NODE_ENV ?? "development";

dotenv.config({ path: `.env.${ENV}` });

const app: Express = express();
const port = process.env.PORT ?? 3000;

const whitelist = ["https://prod.example.com"];
const corsCondition = (origin: string | undefined) => {
  return ENV !== "production"
    ? !origin || whitelist.includes(origin)
    : origin && whitelist.includes(origin);
};

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (corsCondition(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));
app.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to Nodecommerce - ${ENV}`);
});

app.listen(port, () => {
  console.log(
    `[server]: Server is running at http://localhost:${port as string}`
  );
});
