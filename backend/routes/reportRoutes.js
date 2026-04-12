import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { invoiceReport, monthlySalesReport, monthlyStockReport } from "../controllers/reportController.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/monthly-stock", monthlyStockReport);
router.get("/monthly-sales", monthlySalesReport);
router.get("/invoices", invoiceReport);

export default router;

