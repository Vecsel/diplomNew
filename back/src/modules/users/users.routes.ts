import { Router } from "express";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { validate } from "../../common/middleware/validate.js";
import { usersController } from "./users.controller.js";
import { createUserSchema, updateUserSchema, userIdParamsSchema, usersListSchema, usersStatsSchema } from "./users.schemas.js";

export const usersRouter = Router();

usersRouter.get("/stats", validate(usersStatsSchema), asyncHandler(usersController.stats));
usersRouter.get("/", validate(usersListSchema), asyncHandler(usersController.list));
usersRouter.get("/:id", validate(userIdParamsSchema), asyncHandler(usersController.getById));
usersRouter.post("/", validate(createUserSchema), asyncHandler(usersController.create));
usersRouter.patch("/:id", validate(updateUserSchema), asyncHandler(usersController.update));
usersRouter.delete("/:id", validate(userIdParamsSchema), asyncHandler(usersController.remove));
