import { z } from "zod";

export const habitCreateSchema = z.object({
  habit_key: z.string().min(1).max(128).optional(),
  icon: z.string().min(1).max(16).default("✅"),
  label: z.string().min(1).max(160),
  detail: z.string().max(320).optional(),
  category: z.string().max(64).optional(),
  frequency: z.string().max(32).default("daily"),
  target: z.coerce.number().min(0).max(10000).optional(),
  unit: z.string().max(32).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  phase: z.number().int().min(1).max(10).default(1),
  sort_order: z.number().int().min(0).default(0),
}).passthrough();

export const habitUpdateSchema = habitCreateSchema.partial();
