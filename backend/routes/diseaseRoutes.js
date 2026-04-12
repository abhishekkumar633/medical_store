import { Router } from "express";
import { listDiseases } from "../controllers/diseaseController.js";

const router = Router();

router.get("/", listDiseases);

export default router;

