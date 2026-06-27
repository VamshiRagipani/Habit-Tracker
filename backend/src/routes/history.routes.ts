import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getHistory } from "../controllers/history.controller";

const router = Router();
router.use(requireAuth);
router.get("/", getHistory);

export default router;
