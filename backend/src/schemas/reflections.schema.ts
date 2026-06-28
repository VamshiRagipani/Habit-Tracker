import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const upsertReflectionSchema = z.object({
  log_date: z.string().regex(dateRegex, "log_date must be YYYY-MM-DD"),
  body: z.string().max(4000).default(""),
});

export const listReflectionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
