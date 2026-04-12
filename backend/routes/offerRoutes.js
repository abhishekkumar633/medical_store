import { Router } from "express";
import { listOffers, validateCoupon } from "../controllers/offerController.js";

const router = Router();

router.get("/", listOffers);
router.post("/validate-coupon", validateCoupon);

export default router;

