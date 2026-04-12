import { Router } from "express";
import { addToCart, applyCoupon, clearCart, getMyCart, updateCartItem } from "../controllers/cartController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getMyCart);
router.post("/items", requireAuth, addToCart);
router.put("/items", requireAuth, updateCartItem);
router.delete("/", requireAuth, clearCart);
router.post("/apply-coupon", requireAuth, applyCoupon);

export default router;

