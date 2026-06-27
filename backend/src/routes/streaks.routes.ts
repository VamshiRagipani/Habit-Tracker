import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getStreaks } from "../controllers/streaks.controller";

const router = Router();
router.use(requireAuth);
router.get("/", getStreaks);

export default router;
