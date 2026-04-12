import Category from "../models/Category.js";

export async function listCategories(req, res, next) {
  try {
    const items = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

