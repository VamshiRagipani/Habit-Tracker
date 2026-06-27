import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const toggleLogSchema = z.object({
  habit_id: z.string().uuid(),
  log_date: z.string().regex(dateRegex, "log_date must be YYYY-MM-DD"),
});

export const logRangeQuerySchema = z.object({
  start: z.string().regex(dateRegex, "start must be YYYY-MM-DD"),
  end: z.string().regex(dateRegex, "end must be YYYY-MM-DD"),
});
