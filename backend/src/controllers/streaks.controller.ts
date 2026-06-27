import { Request, Response, NextFunction } from "express";
import { computeStreak } from "../services/streaks.service";

export async function getStreaks(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await computeStreak(req.supabase!, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
