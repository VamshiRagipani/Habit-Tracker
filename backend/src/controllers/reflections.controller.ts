import { Request, Response, NextFunction } from "express";
import * as reflectionsService from "../services/reflections.service";

export async function getReflections(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit } = req.query as unknown as { limit: number };
    const reflections = await reflectionsService.listReflections(req.supabase!, req.user!.id, limit);
    res.json({ reflections });
  } catch (err) {
    next(err);
  }
}

export async function postReflection(req: Request, res: Response, next: NextFunction) {
  try {
    const { log_date, body } = req.body;
    const reflection = await reflectionsService.upsertReflection(req.supabase!, req.user!.id, log_date, body);
    res.json({ reflection });
  } catch (err) {
    next(err);
  }
}

export async function removeReflection(req: Request, res: Response, next: NextFunction) {
  try {
    await reflectionsService.deleteReflection(req.supabase!, req.user!.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
