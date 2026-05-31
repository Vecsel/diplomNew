import { Router } from "express";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { validate } from "../../common/middleware/validate.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authController } from "./auth.controller.js";
import { loginSchema } from "./auth.schemas.js";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), asyncHandler(authController.login));
authRouter.get("/me", authMiddleware, asyncHandler(authController.me));
