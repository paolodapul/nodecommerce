import express from "express";
import * as authController from "../controllers/auth-controller";
import { asyncHandler } from "../utils/async-handler";

const router = express.Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));

export default router;
