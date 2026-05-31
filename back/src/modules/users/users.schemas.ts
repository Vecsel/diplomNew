import { z } from "zod";

const usersListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(255).optional(),
  status: z.enum(["all", "active", "inactive"]).default("all")
});

export const usersListSchema = z.object({
  params: z.object({}).optional().default({}),
  body: z.object({}).optional().default({}),
  query: usersListQuerySchema
});

export const usersStatsSchema = z.object({
  params: z.object({}).optional().default({}),
  body: z.object({}).optional().default({}),
  query: z.object({}).optional().default({})
});

export const userIdParamsSchema = z.object({
  body: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.coerce.number().int().positive()
  })
});

export const createUserSchema = z.object({
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
  body: z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    fullName: z.string().min(2).max(255),
    isActive: z.boolean().optional(),
    groupIds: z.array(z.coerce.number().int().positive()).optional()
  })
});

export const updateUserSchema = z.object({
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.coerce.number().int().positive()
  }),
  body: z
    .object({
      username: z.string().min(3).max(50).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).max(100).optional(),
      fullName: z.string().min(2).max(255).optional(),
      isActive: z.boolean().optional(),
      groupIds: z.array(z.coerce.number().int().positive()).optional()
    })
    .refine((obj) => Object.keys(obj).length > 0, "At least one field is required")
});
