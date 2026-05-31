import type { Request, Response } from "express";
import { AppError } from "../../common/utils/app-error.js";
import { groupsService } from "./groups.service.js";

function parseGroupsListQuery(req: Request) {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const q = typeof req.query.q === "string" ? req.query.q : "";
  return { page, limit, q };
}

function parseIdParam(req: Request) {
  return Number(req.params.id);
}

export const groupsController = {
  async list(req: Request, res: Response) {
    const result = await groupsService.getAll(parseGroupsListQuery(req));
    return res.json(result);
  },

  async getById(req: Request, res: Response) {
    const group = await groupsService.findById(parseIdParam(req));
    if (!group) throw new AppError(404, "Group not found");
    return res.json(group);
  },

  async create(req: Request, res: Response) {
    const created = await groupsService.create(req.body);
    return res.status(201).json(created);
  },

  async update(req: Request, res: Response) {
    const updated = await groupsService.update(parseIdParam(req), req.body);
    if (!updated) throw new AppError(404, "Group not found");
    return res.json(updated);
  },

  async remove(req: Request, res: Response) {
    const deleted = await groupsService.remove(parseIdParam(req));
    if (!deleted) throw new AppError(404, "Group not found");
    return res.status(204).send();
  }
};
