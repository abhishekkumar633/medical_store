import Offer from "../models/Offer.js";

function isOfferActiveNow(offer) {
  if (!offer.isActive) return false;
  const now = new Date();
  if (offer.activeFrom && now < offer.activeFrom) return false;
  if (offer.activeTo && now > offer.activeTo) return false;
  return true;
}

export async function listOffers(req, res, next) {
  try {
    const items = await Offer.find({ isActive: true }).sort({ createdAt: -1 }).limit(50);
    res.json({ items: items.filter(isOfferActiveNow) });
  } catch (err) {
    next(err);
  }
}

export async function validateCoupon(req, res, next) {
  try {
    const { couponCode, cartSubtotal } = req.body || {};
    if (!couponCode) return res.status(400).json({ message: "Coupon code required" });

    const offer = await Offer.findOne({ couponCode: String(couponCode).toUpperCase().trim(), isActive: true });
    if (!offer || !isOfferActiveNow(offer)) return res.status(404).json({ message: "Invalid coupon" });

    const subtotal = Math.max(0, Number(cartSubtotal) || 0);
    if (subtotal < (offer.minCartAmount || 0)) {
      return res.status(400).json({ message: "Cart amount too low for this coupon" });
    }

    const raw = (subtotal * offer.discountPercent) / 100;
    const capped = offer.maxDiscountAmount != null ? Math.min(raw, offer.maxDiscountAmount) : raw;

    res.json({
      offer: {
        id: offer._id,
        title: offer.title,
        discountPercent: offer.discountPercent,
        couponCode: offer.couponCode,
      },
      discountAmount: Math.max(0, Math.round(capped * 100) / 100),
    });
  } catch (err) {
    next(err);
  }
}

