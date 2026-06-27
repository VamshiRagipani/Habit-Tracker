import { Request, Response, NextFunction } from "express";
import * as logsService from "../services/logs.service";

export async function getLogsRange(req: Request, res: Response, next: NextFunction) {
  try {
    const { start, end } = req.query as unknown as { start: string; end: string };
    const logs = await logsService.getLogsInRange(req.supabase!, req.user!.id, start, end);
    res.json({ logs });
  } catch (err) {
    next(err);
  }
}

export async function postToggleLog(req: Request, res: Response, next: NextFunction) {
  try {
    const { habit_id, log_date } = req.body;
    const log = await logsService.toggleLog(req.supabase!, req.user!.id, habit_id, log_date);
    res.json({ log });
  } catch (err) {
    next(err);
  }
}
