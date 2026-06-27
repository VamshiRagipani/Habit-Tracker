import { z } from "zod";

export const habitCreateSchema = z.object({
  habit_key: z.string().min(1).max(64),
  icon: z.string().min(1).max(8).default("✅"),
  label: z.string().min(1).max(120),
  detail: z.string().max(280).optional(),
  phase: z.number().int().min(1).max(10).default(1),
  sort_order: z.number().int().min(0).default(0),
});

export const habitUpdateSchema = habitCreateSchema.partial();
