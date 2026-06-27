import { Request, Response, NextFunction } from "express";
import * as habitsService from "../services/habits.service";

export async function getHabits(req: Request, res: Response, next: NextFunction) {
  try {
    const habits = await habitsService.listHabits(req.supabase!, req.user!.id);
    res.json({ habits });
  } catch (err) {
    next(err);
  }
}

export async function postHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const habit = await habitsService.createHabit(req.supabase!, req.user!.id, req.body);
    res.status(201).json({ habit });
  } catch (err) {
    next(err);
  }
}

export async function putHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const habit = await habitsService.updateHabit(req.supabase!, req.user!.id, req.params.id, req.body);
    res.json({ habit });
  } catch (err) {
    next(err);
  }
}

export async function removeHabit(req: Request, res: Response, next: NextFunction) {
  try {
    await habitsService.deleteHabit(req.supabase!, req.user!.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
