import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { updateProfileSchema } from "../schemas/profile.schema";
import { getMyProfile, putMyProfile } from "../controllers/profile.controller";

const router = Router();
router.use(requireAuth);
router.get("/", getMyProfile);
router.put("/", validateBody(updateProfileSchema), putMyProfile);

export default router;
