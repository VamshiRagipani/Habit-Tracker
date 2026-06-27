import { NextFunction, Request, Response } from "express";
import { supabaseAuthClient, createUserClient } from "../config/supabase";

/**
 * Verifies the Supabase access token sent by the frontend and attaches:
 *  - req.user      -> { id, email }
 *  - req.supabase  -> a Supabase client scoped to this user (RLS-enforced)
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Missing bearer token" });
    }

    const { data, error } = await supabaseAuthClient.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = { id: data.user.id, email: data.user.email ?? undefined };
    req.supabase = createUserClient(token);
    next();
  } catch (err) {
    next(err);
  }
}
