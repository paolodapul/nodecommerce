import cors, { CorsOptions } from "cors";

const ENV = process.env.NODE_ENV ?? "development";

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

const corsMiddleware = cors(corsOptions);

export { corsMiddleware };
