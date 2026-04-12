import { Router } from "express";
import { getMedicine, listMedicines } from "../controllers/medicineController.js";

const router = Router();

router.get("/", listMedicines);
router.get("/:id", getMedicine);

export default router;

