import { z } from "zod";

const permissionCodesSchema = z.array(z.string().min(3)).optional();

const groupsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(255).optional()
});

export const groupsListSchema = z.object({
  params: z.object({}).optional().default({}),
  body: z.object({}).optional().default({}),
  query: groupsListQuerySchema
});

export const groupIdParamsSchema = z.object({
  body: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.coerce.number().int().positive()
  })
});

export const createGroupSchema = z.object({
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
  body: z.object({
    code: z.string().min(1).max(50),
    title: z.string().min(1).max(255),
    description: z.string().max(500).optional(),
    permissionCodes: permissionCodesSchema
  })
});

export const updateGroupSchema = z.object({
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.coerce.number().int().positive()
  }),
  body: z
    .object({
      code: z.string().min(1).max(50).optional(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().max(500).optional(),
      permissionCodes: permissionCodesSchema
    })
    .refine((obj) => Object.keys(obj).length > 0, "At least one field is required")
});
