import type { Request, Response } from "express";
import { AppError } from "../../common/utils/app-error.js";
import { authService } from "./auth.service.js";

export const authController = {
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body.login, req.body.password);
    if (!result) throw new AppError(401, "Invalid credentials");
    return res.json(result);
  },

  async me(req: Request, res: Response) {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const profile = await authService.me(Number(req.user.sub));
    if (!profile) throw new AppError(404, "User not found");
    return res.json(profile);
  }
};
