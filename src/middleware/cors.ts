import cors, { CorsOptions } from "cors";

const ENV = process.env.NODE_ENV ?? "development";

const whitelist = [process.env.EC2_PUBLIC_DNS];
const corsCondition = (origin: string | undefined) => {
  console.log("[origin]", origin);

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
