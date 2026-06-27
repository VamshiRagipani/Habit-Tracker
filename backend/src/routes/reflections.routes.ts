import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import { upsertReflectionSchema, listReflectionsQuerySchema } from "../schemas/reflections.schema";
import { getReflections, postReflection, removeReflection } from "../controllers/reflections.controller";

const router = Router();
router.use(requireAuth);

router.get("/", validateQuery(listReflectionsQuerySchema), getReflections);
router.post("/", validateBody(upsertReflectionSchema), postReflection);
router.delete("/:id", removeReflection);

export default router;
