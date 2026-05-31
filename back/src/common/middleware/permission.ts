import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";
import { permissionsService } from "../../modules/permissions/permissions.service.js";

export function requirePermission(permissionCode: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, "Unauthorized"));

    const hasPermission = await permissionsService.userHasPermission(Number(req.user.sub), permissionCode);
    if (!hasPermission) {
      return next(new AppError(403, "Forbidden"));
    }

    return next();
  };
}
