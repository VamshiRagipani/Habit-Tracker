import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import { toggleLogSchema, logRangeQuerySchema } from "../schemas/logs.schema";
import { getLogsRange, postToggleLog } from "../controllers/logs.controller";

const router = Router();
router.use(requireAuth);

router.get("/", validateQuery(logRangeQuerySchema), getLogsRange);
router.post("/toggle", validateBody(toggleLogSchema), postToggleLog);

export default router;
