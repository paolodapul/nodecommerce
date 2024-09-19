import express, { Request, Response } from "express";

const router = express.Router();
const ENV = process.env.NODE_ENV ?? "development";

router.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to Nodecommerce!! - ${ENV}`);
});

export default router;
