import { Router } from "express";
import { companyMedicines, listCompanies } from "../controllers/companyController.js";

const router = Router();

router.get("/", listCompanies);
router.get("/:id/medicines", companyMedicines);

export default router;

