/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import * as userController from "../controllers/user-controller";
import authController from "../controllers/auth-controller";

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", authController.login);

export default router;
