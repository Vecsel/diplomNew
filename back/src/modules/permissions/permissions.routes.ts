import { Router } from "express";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { permissionsController } from "./permissions.controller.js";

export const permissionsRouter = Router();

permissionsRouter.get("/", asyncHandler(permissionsController.getAll));
