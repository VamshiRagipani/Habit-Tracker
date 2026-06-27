import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "./errorHandler";

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ApiError(400, result.error.issues.map((i) => i.message).join("; ")));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(new ApiError(400, result.error.issues.map((i) => i.message).join("; ")));
    }
    req.query = result.data as any;
    next();
  };
}
