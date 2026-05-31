import type { Request, Response } from "express";
import { AppError } from "../../common/utils/app-error.js";
import { usersService } from "./users.service.js";

type UserListStatus = "all" | "active" | "inactive";

function parseUserListQuery(req: Request) {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const status: UserListStatus =
    req.query.status === "active" || req.query.status === "inactive" || req.query.status === "all" ? req.query.status : "all";

  return { page, limit, q, status };
}

function parseIdParam(req: Request) {
  return Number(req.params.id);
}

export const usersController = {
  async stats(_req: Request, res: Response) {
    const result = await usersService.getStats();
    return res.json(result);
  },

  async list(req: Request, res: Response) {
    const result = await usersService.getAll(parseUserListQuery(req));
    return res.json(result);
  },

  async getById(req: Request, res: Response) {
    const user = await usersService.findById(parseIdParam(req));
    if (!user) throw new AppError(404, "User not found");
    return res.json(user);
  },

  async create(req: Request, res: Response) {
    const created = await usersService.create(req.body);
    return res.status(201).json(created);
  },

  async update(req: Request, res: Response) {
    const updated = await usersService.update(parseIdParam(req), req.body);
    if (!updated) throw new AppError(404, "User not found");
    return res.json(updated);
  },

  async remove(req: Request, res: Response) {
    const deleted = await usersService.remove(parseIdParam(req));
    if (!deleted) throw new AppError(404, "User not found");
    return res.status(204).send();
  }
};
