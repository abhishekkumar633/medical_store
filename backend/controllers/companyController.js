import Company from "../models/Company.js";
import Medicine from "../models/Medicine.js";

export async function listCompanies(req, res, next) {
  try {
    const items = await Company.find({ isActive: true }).sort({ name: 1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function companyMedicines(req, res, next) {
  try {
    const { id } = req.params;
    const items = await Medicine.find({ company: id, isActive: true }).sort({ createdAt: -1 }).limit(100);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

