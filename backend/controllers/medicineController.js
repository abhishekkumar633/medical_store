import Medicine from "../models/Medicine.js";

export async function listMedicines(req, res, next) {
  try {
    const {
      q,
      type,
      category,
      disease,
      company,
      requiresPrescription,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isActive: true };
    if (type) filter.type = String(type);
    if (category) filter.category = String(category);
    if (company) filter.company = String(company);
    if (disease) filter.diseases = String(disease);
    if (requiresPrescription !== undefined) {
      if (String(requiresPrescription) === "true") filter.requiresPrescription = true;
      if (String(requiresPrescription) === "false") filter.requiresPrescription = false;
    }

    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(50, Math.max(1, Number(limit) || 12));

    let query = Medicine.find(filter);
    if (q) {
      query = query.find({ $text: { $search: String(q) } });
    }

    const [items, total] = await Promise.all([
      query
        .populate("category", "name")
        .populate("company", "name")
        .populate("diseases", "name")
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l),
      Medicine.countDocuments(q ? { ...filter, $text: { $search: String(q) } } : filter),
    ]);

    res.json({ items, page: p, limit: l, total });
  } catch (err) {
    next(err);
  }
}

export async function getMedicine(req, res, next) {
  try {
    const item = await Medicine.findById(req.params.id)
      .populate("category", "name")
      .populate("company", "name")
      .populate("diseases", "name");
    if (!item) return res.status(404).json({ message: "Medicine not found" });
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

