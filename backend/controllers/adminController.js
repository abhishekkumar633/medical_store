import Category from "../models/Category.js";
import Company from "../models/Company.js";
import Disease from "../models/Disease.js";
import Medicine from "../models/Medicine.js";
import Offer from "../models/Offer.js";
import CustomerMessage from "../models/CustomerMessage.js";
import Prescription from "../models/Prescription.js";
import StockLedger from "../models/StockLedger.js";
import { fetchMedicineImageUrl } from "../services/fetchMedicineImageUrl.js";

function pick(obj, keys) {
  const out = {};
  for (const k of keys) if (obj?.[k] !== undefined) out[k] = obj[k];
  return out;
}

function hasUsableImageList(images) {
  if (!Array.isArray(images)) return false;
  return images.some((u) => typeof u === "string" && u.trim().length > 0);
}

// ---- Category CRUD ----
export async function adminCreateCategory(req, res, next) {
  try {
    const { name, description, isActive } = req.body || {};
    if (!name) return res.status(400).json({ message: "name required" });
    const item = await Category.create({
      name: String(name).trim(),
      description: description ? String(description).trim() : undefined,
      isActive: isActive === undefined ? true : Boolean(isActive),
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

export async function adminListCategories(req, res, next) {
  try {
    const items = await Category.find({}).sort({ name: 1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateCategory(req, res, next) {
  try {
    const update = pick(req.body, ["name", "description", "isActive"]);
    if (update.name) update.name = String(update.name).trim();
    if (update.description) update.description = String(update.description).trim();
    const item = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ message: "Category not found" });
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

export async function adminDeleteCategory(req, res, next) {
  try {
    const item = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json({ message: "Category not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ---- Disease CRUD ----
export async function adminCreateDisease(req, res, next) {
  try {
    const { name, description, isActive } = req.body || {};
    if (!name) return res.status(400).json({ message: "name required" });
    const item = await Disease.create({
      name: String(name).trim(),
      description: description ? String(description).trim() : undefined,
      isActive: isActive === undefined ? true : Boolean(isActive),
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

export async function adminListDiseases(req, res, next) {
  try {
    const items = await Disease.find({}).sort({ name: 1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateDisease(req, res, next) {
  try {
    const update = pick(req.body, ["name", "description", "isActive"]);
    if (update.name) update.name = String(update.name).trim();
    if (update.description) update.description = String(update.description).trim();
    const item = await Disease.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ message: "Disease not found" });
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

export async function adminDeleteDisease(req, res, next) {
  try {
    const item = await Disease.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json({ message: "Disease not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ---- Company CRUD ----
export async function adminCreateCompany(req, res, next) {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ message: "name required" });
    const item = await Company.create({
      ...pick(req.body, ["website", "email", "phone", "address", "isActive"]),
      name: String(name).trim(),
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

export async function adminListCompanies(req, res, next) {
  try {
    const items = await Company.find({}).sort({ name: 1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateCompany(req, res, next) {
  try {
    const update = pick(req.body, ["name", "website", "email", "phone", "address", "isActive"]);
    if (update.name) update.name = String(update.name).trim();
    const item = await Company.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ message: "Company not found" });
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

export async function adminDeleteCompany(req, res, next) {
  try {
    const item = await Company.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json({ message: "Company not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ---- Medicine CRUD ----
export async function adminCreateMedicine(req, res, next) {
  try {
    const { name, type, mrp, price } = req.body || {};
    if (!name || !type || mrp === undefined || price === undefined) {
      return res.status(400).json({ message: "name, type, mrp, price required" });
    }
    const picked = pick(req.body, [
      "description",
      "category",
      "diseases",
      "company",
      "mrp",
      "price",
      "stockQty",
      "requiresPrescription",
      "isActive",
      "images",
      "sku",
      "composition",
      "dosage",
      "expiryDate",
    ]);
    const item = await Medicine.create({
      ...picked,
      name: String(name).trim(),
      type: String(type).trim(),
    });

    if (!hasUsableImageList(item.images)) {
      const url = await fetchMedicineImageUrl(item.name);
      if (url) {
        item.images = [url];
        await item.save();
      }
    }

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

export async function adminListMedicines(req, res, next) {
  try {
    const items = await Medicine.find({})
      .populate("category", "name")
      .populate("company", "name")
      .populate("diseases", "name")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateMedicine(req, res, next) {
  try {
    const prev = await Medicine.findById(req.params.id);
    if (!prev) return res.status(404).json({ message: "Medicine not found" });

    const imagesInBody = Object.prototype.hasOwnProperty.call(req.body || {}, "images");

    const update = pick(req.body, [
      "name",
      "type",
      "description",
      "category",
      "diseases",
      "company",
      "mrp",
      "price",
      "stockQty",
      "requiresPrescription",
      "isActive",
      "images",
      "sku",
      "composition",
      "dosage",
      "expiryDate",
    ]);
    if (update.name) update.name = String(update.name).trim();
    if (update.type) update.type = String(update.type).trim();

    const nameChanged = Boolean(update.name && update.name !== prev.name);

    const item = await Medicine.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ message: "Medicine not found" });

    if (!imagesInBody && nameChanged) {
      const url = await fetchMedicineImageUrl(item.name);
      if (url) {
        item.images = [url];
        await item.save();
      }
    }

    res.json({ item });
  } catch (err) {
    next(err);
  }
}

export async function adminDeleteMedicine(req, res, next) {
  try {
    const item = await Medicine.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json({ message: "Medicine not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function adminAdjustStock(req, res, next) {
  try {
    const { changeQty, reason } = req.body || {};
    const delta = Number(changeQty);
    if (!Number.isFinite(delta) || delta === 0) return res.status(400).json({ message: "changeQty required" });
    const med = await Medicine.findByIdAndUpdate(req.params.id, { $inc: { stockQty: delta } }, { new: true });
    if (!med) return res.status(404).json({ message: "Medicine not found" });
    await StockLedger.create({ medicine: med._id, changeQty: delta, reason: reason ? String(reason) : "Admin adjust", createdBy: req.user._id });
    res.json({ item: med });
  } catch (err) {
    next(err);
  }
}

export async function adminUpdatePrice(req, res, next) {
  try {
    const { price, mrp } = req.body || {};
    const update = {};
    if (price !== undefined) update.price = Number(price);
    if (mrp !== undefined) update.mrp = Number(mrp);
    const med = await Medicine.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!med) return res.status(404).json({ message: "Medicine not found" });
    res.json({ item: med });
  } catch (err) {
    next(err);
  }
}

// ---- Offer CRUD ----
export async function adminCreateOffer(req, res, next) {
  try {
    const { title, discountPercent } = req.body || {};
    if (!title || discountPercent === undefined) return res.status(400).json({ message: "title, discountPercent required" });
    const item = await Offer.create({
      ...pick(req.body, [
        "description",
        "discountPercent",
        "couponCode",
        "activeFrom",
        "activeTo",
        "isActive",
        "appliesToAll",
        "medicineTypes",
        "categories",
        "medicines",
        "minCartAmount",
        "maxDiscountAmount",
      ]),
      title: String(title).trim(),
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

export async function adminListOffers(req, res, next) {
  try {
    const items = await Offer.find({}).sort({ createdAt: -1 }).limit(200);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateOffer(req, res, next) {
  try {
    const update = pick(req.body, [
      "title",
      "description",
      "discountPercent",
      "couponCode",
      "activeFrom",
      "activeTo",
      "isActive",
      "appliesToAll",
      "medicineTypes",
      "categories",
      "medicines",
      "minCartAmount",
      "maxDiscountAmount",
    ]);
    if (update.title) update.title = String(update.title).trim();
    const item = await Offer.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ message: "Offer not found" });
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

export async function adminDeleteOffer(req, res, next) {
  try {
    const item = await Offer.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json({ message: "Offer not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ---- Prescription workflow ----
export async function adminListPrescriptions(req, res, next) {
  try {
    const { status = "PENDING" } = req.query;
    const items = await Prescription.find({ status: String(status) })
      .populate("user", "name email")
      .populate("order", "invoiceNo")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function adminReviewPrescription(req, res, next) {
  try {
    const { status, adminNote } = req.body || {};
    if (!["APPROVED", "REJECTED"].includes(String(status))) return res.status(400).json({ message: "status must be APPROVED or REJECTED" });
    const item = await Prescription.findByIdAndUpdate(
      req.params.id,
      { status: String(status), adminNote: adminNote ? String(adminNote) : undefined, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Prescription not found" });
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

// ---- Customer messages / call requests ----
export async function adminListMessages(req, res, next) {
  try {
    const { status = "OPEN" } = req.query;
    const items = await CustomerMessage.find({ status: String(status) })
      .populate("user", "name email")
      .populate("order", "invoiceNo")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateMessage(req, res, next) {
  try {
    const update = pick(req.body, ["status", "assignedTo", "resolutionNote"]);
    const item = await CustomerMessage.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ message: "Message not found" });
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

