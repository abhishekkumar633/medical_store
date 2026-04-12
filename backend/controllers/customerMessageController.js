import CustomerMessage from "../models/CustomerMessage.js";

export async function createMessage(req, res, next) {
  try {
    const { type, subject, message, order } = req.body || {};
    if (!message) return res.status(400).json({ message: "message required" });
    const item = await CustomerMessage.create({
      user: req.user._id,
      order: order || undefined,
      type: type || "GENERAL",
      subject: subject ? String(subject) : undefined,
      message: String(message),
      status: "OPEN",
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

export async function myMessages(req, res, next) {
  try {
    const items = await CustomerMessage.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

