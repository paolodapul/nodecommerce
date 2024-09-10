import cors, { CorsOptions } from "cors";

const whitelist = [process.env.EC2_PUBLIC_DNS];

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

const corsMiddleware = cors(corsOptions);

export { corsMiddleware };
