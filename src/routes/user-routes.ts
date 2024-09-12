/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import authController from "../controllers/auth-controller";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
