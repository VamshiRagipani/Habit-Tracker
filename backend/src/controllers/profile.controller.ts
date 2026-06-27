import { Request, Response, NextFunction } from "express";
import * as profileService from "../services/profile.service";

export async function getMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await profileService.getProfile(req.supabase!, req.user!.id);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

export async function putMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await profileService.updateProfile(req.supabase!, req.user!.id, req.body);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}
