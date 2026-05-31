import { Router } from "express";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { validate } from "../../common/middleware/validate.js";
import { groupsController } from "./groups.controller.js";
import { createGroupSchema, groupIdParamsSchema, groupsListSchema, updateGroupSchema } from "./groups.schemas.js";

export const groupsRouter = Router();

groupsRouter.get("/", validate(groupsListSchema), asyncHandler(groupsController.list));
groupsRouter.get("/:id", validate(groupIdParamsSchema), asyncHandler(groupsController.getById));
groupsRouter.post("/", validate(createGroupSchema), asyncHandler(groupsController.create));
groupsRouter.patch("/:id", validate(updateGroupSchema), asyncHandler(groupsController.update));
groupsRouter.delete("/:id", validate(groupIdParamsSchema), asyncHandler(groupsController.remove));
