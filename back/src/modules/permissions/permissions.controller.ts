import type { Request, Response } from "express";
import { permissionsService } from "./permissions.service.js";

export const permissionsController = {
  async getAll(_req: Request, res: Response) {
    const items = await permissionsService.getAll();
    return res.json({ items });
  }
};
