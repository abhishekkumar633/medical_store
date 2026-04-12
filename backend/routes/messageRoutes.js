import { Router } from "express";
import { createMessage, myMessages } from "../controllers/customerMessageController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, myMessages);
router.post("/", requireAuth, createMessage);

export default router;

