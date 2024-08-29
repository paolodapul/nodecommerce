import { createApp } from "./server";
import dotenv from "dotenv";

const ENV = process.env.NODE_ENV ?? "development";
dotenv.config({ path: `.env.${ENV}` });

const port = process.env.PORT ?? 3000;
const app = createApp(ENV);

app.listen(port, () => {
  console.log(
    `[server]: Server is running at http://localhost:${port as string}`
  );
});
