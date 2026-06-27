import { z } from "zod";

export const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(80),
});
