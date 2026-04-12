import Cart from "../models/Cart.js";
import Medicine from "../models/Medicine.js";
import Offer from "../models/Offer.js";

function calcSubtotal(items) {
  return items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);
}

async function resolveOfferFromCoupon(couponCode) {
  if (!couponCode) return null;
  return Offer.findOne({ couponCode: String(couponCode).toUpperCase().trim(), isActive: true });
}

function isOfferActiveNow(offer) {
  if (!offer?.isActive) return false;
  const now = new Date();
  if (offer.activeFrom && now < offer.activeFrom) return false;
  if (offer.activeTo && now > offer.activeTo) return false;
  return true;
}

function calcDiscount(subtotal, offer) {
  if (!offer || !isOfferActiveNow(offer)) return 0;
  if (subtotal < (offer.minCartAmount || 0)) return 0;
  const raw = (subtotal * offer.discountPercent) / 100;
  const capped = offer.maxDiscountAmount != null ? Math.min(raw, offer.maxDiscountAmount) : raw;
  return Math.max(0, Math.round(capped * 100) / 100);
}

export async function getMyCart(req, res, next) {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.medicine");
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const subtotal = calcSubtotal(cart.items);
    const offer = cart.couponCode ? await resolveOfferFromCoupon(cart.couponCode) : null;
    const discount = calcDiscount(subtotal, offer);
    res.json({ cart, summary: { subtotal, discount, total: Math.max(0, subtotal - discount) } });
  } catch (err) {
    next(err);
  }
}

export async function addToCart(req, res, next) {
  try {
    const { medicineId, qty } = req.body || {};
    const q = Math.max(1, Number(qty) || 1);
    if (!medicineId) return res.status(400).json({ message: "medicineId required" });

    const medicine = await Medicine.findById(medicineId);
    if (!medicine || !medicine.isActive) return res.status(404).json({ message: "Medicine not found" });
    if (medicine.stockQty < q) return res.status(400).json({ message: "Insufficient stock" });

    const cart = (await Cart.findOne({ user: req.user._id })) || (await Cart.create({ user: req.user._id, items: [] }));
    const idx = cart.items.findIndex((it) => it.medicine.toString() === medicine._id.toString());
    if (idx >= 0) {
      const newQty = cart.items[idx].qty + q;
      if (medicine.stockQty < newQty) return res.status(400).json({ message: "Insufficient stock" });
      cart.items[idx].qty = newQty;
      cart.items[idx].unitPrice = medicine.price;
    } else {
      cart.items.push({ medicine: medicine._id, qty: q, unitPrice: medicine.price });
    }

    await cart.save();
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const { medicineId, qty } = req.body || {};
    if (!medicineId) return res.status(400).json({ message: "medicineId required" });
    const q = Number(qty);
    if (!Number.isFinite(q)) return res.status(400).json({ message: "qty required" });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const idx = cart.items.findIndex((it) => it.medicine.toString() === String(medicineId));
    if (idx < 0) return res.status(404).json({ message: "Item not in cart" });

    if (q <= 0) {
      cart.items.splice(idx, 1);
    } else {
      const medicine = await Medicine.findById(medicineId);
      if (!medicine || !medicine.isActive) return res.status(404).json({ message: "Medicine not found" });
      if (medicine.stockQty < q) return res.status(400).json({ message: "Insufficient stock" });
      cart.items[idx].qty = q;
      cart.items[idx].unitPrice = medicine.price;
    }

    await cart.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req, res, next) {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [], couponCode: null, appliedOffer: null } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function applyCoupon(req, res, next) {
  try {
    const { couponCode } = req.body || {};
    if (!couponCode) return res.status(400).json({ message: "couponCode required" });

    const offer = await resolveOfferFromCoupon(couponCode);
    if (!offer || !isOfferActiveNow(offer)) return res.status(404).json({ message: "Invalid coupon" });

    const cart = (await Cart.findOne({ user: req.user._id })) || (await Cart.create({ user: req.user._id, items: [] }));
    const subtotal = calcSubtotal(cart.items);
    if (subtotal < (offer.minCartAmount || 0)) return res.status(400).json({ message: "Cart amount too low for this coupon" });

    cart.couponCode = offer.couponCode;
    cart.appliedOffer = offer._id;
    await cart.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

