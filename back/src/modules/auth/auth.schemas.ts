import { z } from "zod";

export const loginSchema = z.object({
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
  body: z.object({
    login: z.string().min(3).max(255),
    password: z.string().min(6).max(100)
  })
});
