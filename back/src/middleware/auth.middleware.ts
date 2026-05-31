import type { NextFunction, Request, Response } from "express";
import { AppError } from "../common/utils/app-error.js";
import { verifyToken } from "../common/utils/jwt.js";
import { usersService } from "../modules/users/users.service.js";

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError(401, "Unauthorized"));
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = verifyToken(token);
    const user = await usersService.findById(Number(payload.sub));
    if (!user || !user.isActive) {
      return next(new AppError(401, "User is inactive or missing"));
    }
    req.user = payload;
    return next();
  } catch {
    return next(new AppError(401, "Invalid token"));
  }
}
