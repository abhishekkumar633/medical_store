import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import {
  adminAdjustStock,
  adminCreateCategory,
  adminCreateCompany,
  adminCreateDisease,
  adminCreateMedicine,
  adminCreateOffer,
  adminDeleteCategory,
  adminDeleteCompany,
  adminDeleteDisease,
  adminDeleteMedicine,
  adminDeleteOffer,
  adminListCategories,
  adminListCompanies,
  adminListDiseases,
  adminListMedicines,
  adminListMessages,
  adminListOffers,
  adminListPrescriptions,
  adminReviewPrescription,
  adminUpdateCategory,
  adminUpdateCompany,
  adminUpdateDisease,
  adminUpdateMedicine,
  adminUpdateMessage,
  adminUpdateOffer,
  adminUpdatePrice,
} from "../controllers/adminController.js";

const router = Router();
router.use(requireAuth, requireAdmin);

// categories
router.get("/categories", adminListCategories);
router.post("/categories", adminCreateCategory);
router.put("/categories/:id", adminUpdateCategory);
router.delete("/categories/:id", adminDeleteCategory);

// diseases
router.get("/diseases", adminListDiseases);
router.post("/diseases", adminCreateDisease);
router.put("/diseases/:id", adminUpdateDisease);
router.delete("/diseases/:id", adminDeleteDisease);

// companies
router.get("/companies", adminListCompanies);
router.post("/companies", adminCreateCompany);
router.put("/companies/:id", adminUpdateCompany);
router.delete("/companies/:id", adminDeleteCompany);

// medicines
router.get("/medicines", adminListMedicines);
router.post("/medicines", adminCreateMedicine);
router.put("/medicines/:id", adminUpdateMedicine);
router.delete("/medicines/:id", adminDeleteMedicine);
router.patch("/medicines/:id/stock", adminAdjustStock);
router.patch("/medicines/:id/price", adminUpdatePrice);

// offers
router.get("/offers", adminListOffers);
router.post("/offers", adminCreateOffer);
router.put("/offers/:id", adminUpdateOffer);
router.delete("/offers/:id", adminDeleteOffer);

// prescriptions
router.get("/prescriptions", adminListPrescriptions);
router.patch("/prescriptions/:id/review", adminReviewPrescription);

// customer messages
router.get("/messages", adminListMessages);
router.patch("/messages/:id", adminUpdateMessage);

export default router;

