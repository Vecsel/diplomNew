import { Router } from "express";
import { authMiddleware } from "./middleware/auth.middleware.js";
import { requirePermission } from "./common/middleware/permission.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { groupsRouter } from "./modules/groups/groups.routes.js";
import { permissionsRouter } from "./modules/permissions/permissions.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);

apiRouter.use("/users", authMiddleware, (req, res, next) => {
  if (req.method === "GET") return requirePermission("users:read")(req, res, next);
  if (req.method === "POST") return requirePermission("users:create")(req, res, next);
  if (req.method === "PATCH") return requirePermission("users:update")(req, res, next);
  if (req.method === "DELETE") return requirePermission("users:delete")(req, res, next);
  return next();
}, usersRouter);

apiRouter.use("/groups", authMiddleware, (req, res, next) => {
  if (req.method === "GET") return requirePermission("groups:read")(req, res, next);
  if (req.method === "POST") return requirePermission("groups:create")(req, res, next);
  if (req.method === "PATCH") return requirePermission("groups:update")(req, res, next);
  if (req.method === "DELETE") return requirePermission("groups:delete")(req, res, next);
  return next();
}, groupsRouter);

apiRouter.use(
  "/permissions",
  authMiddleware,
  requirePermission("permissions:read"),
  permissionsRouter
);
