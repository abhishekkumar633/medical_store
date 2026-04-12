import Disease from "../models/Disease.js";

export async function listDiseases(req, res, next) {
  try {
    const items = await Disease.find({ isActive: true }).sort({ name: 1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

