import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { habitCreateSchema, habitUpdateSchema } from "../schemas/habits.schema";
import { getHabits, postHabit, putHabit, removeHabit } from "../controllers/habits.controller";

const router = Router();
router.use(requireAuth);

router.get("/", getHabits);
router.post("/", validateBody(habitCreateSchema), postHabit);
router.put("/:id", validateBody(habitUpdateSchema), putHabit);
router.delete("/:id", removeHabit);

export default router;
