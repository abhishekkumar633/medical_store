import { Router } from "express";
import { getMyOrder, myOrders, placeOrder } from "../controllers/orderController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, placeOrder);
router.get("/", requireAuth, myOrders);
router.get("/:id", requireAuth, getMyOrder);

export default router;

