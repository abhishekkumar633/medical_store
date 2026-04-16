import Cart from "../models/Cart.js";
import Medicine from "../models/Medicine.js";
import Offer from "../models/Offer.js";
import Order from "../models/Order.js";
import StockLedger from "../models/StockLedger.js";
import { makeInvoiceNo } from "../utils/invoice.js";
import { sendMail } from "../utils/mailer.js";

function calcSubtotal(items) {
  return items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);
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

export async function placeOrder(req, res, next) {
  try {
    const { paymentMethod, paymentSuccess, shippingAddress, notes } = req.body || {};
    if (!shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.pincode) {
      return res.status(400).json({ message: "Complete shipping address is required" });
    }
    if (!paymentMethod || !["COD", "ONLINE"].includes(String(paymentMethod))) {
      return res.status(400).json({ message: "paymentMethod must be COD or ONLINE" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

    // Load medicines fresh for stock + prescription requirement
    const medicineIds = cart.items.map((i) => i.medicine);
    const medicines = await Medicine.find({ _id: { $in: medicineIds }, isActive: true });
    if (medicines.length !== medicineIds.length) return res.status(400).json({ message: "Some medicines are unavailable" });

    const medById = new Map(medicines.map((m) => [m._id.toString(), m]));
    for (const it of cart.items) {
      const m = medById.get(it.medicine.toString());
      if (!m) return res.status(400).json({ message: "Medicine unavailable" });
      if (m.stockQty < it.qty) return res.status(400).json({ message: `Insufficient stock for ${m.name}` });
    }

    // Apply offer (if any)
    const offer = cart.couponCode
      ? await Offer.findOne({ couponCode: cart.couponCode, isActive: true })
      : null;
    const subtotal = calcSubtotal(cart.items);
    const discount = calcDiscount(subtotal, offer);
    const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);

    const orderItems = cart.items.map((it) => {
      const m = medById.get(it.medicine.toString());
      return {
        medicine: m._id,
        name: m.name,
        qty: it.qty,
        unitPrice: m.price, // snapshot at purchase time
        requiresPrescription: !!m.requiresPrescription,
      };
    });

    // Deduct stock (best-effort, no transactions)
    for (const it of orderItems) {
      const updated = await Medicine.findOneAndUpdate(
        { _id: it.medicine, stockQty: { $gte: it.qty } },
        { $inc: { stockQty: -it.qty } },
        { new: true }
      );
      if (!updated) return res.status(400).json({ message: `Insufficient stock for ${it.name}` });
      await StockLedger.create({
        medicine: it.medicine,
        changeQty: -it.qty,
        reason: "Order placed",
        createdBy: req.user._id,
      });
    }

    const isOnline = String(paymentMethod) === "ONLINE";
    const paid = isOnline ? Boolean(paymentSuccess) : false;

    const order = await Order.create({
      invoiceNo: makeInvoiceNo(),
      user: req.user._id,
      items: orderItems,
      subtotal,
      discount,
      total,
      offer: offer?._id,
      couponCode: offer?.couponCode,
      paymentMethod: isOnline ? "ONLINE" : "COD",
      paymentStatus: isOnline ? (paid ? "PAID" : "FAILED") : "PENDING",
      orderStatus: isOnline ? (paid ? "CONFIRMED" : "ON_HOLD") : "CONFIRMED",
      shippingAddress: shippingAddress || {},
      notes: notes ? String(notes) : undefined,
    });

    const addressText = [
      shippingAddress.name,
      shippingAddress.phone,
      shippingAddress.line1,
      shippingAddress.line2,
      `${shippingAddress.city}, ${shippingAddress.state}`,
      shippingAddress.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    // Fire-and-forget mail notification; order should not fail on mail error.
    sendMail({
      to: req.user.email,
      subject: `Order placed successfully (${order.invoiceNo})`,
      text: `Hello ${req.user.name}, your order ${order.invoiceNo} has been placed successfully. Total: INR ${order.total.toFixed(2)}. Delivery address: ${addressText}.`,
      html: `<p>Hello ${req.user.name},</p><p>Your order <strong>${order.invoiceNo}</strong> has been placed successfully.</p><p><strong>Total:</strong> INR ${order.total.toFixed(
        2
      )}</p><p><strong>Delivery address:</strong> ${addressText}</p>`,
    }).catch((mailErr) => {
      console.error("Order mail failed:", mailErr?.message || mailErr);
    });

    // Clear cart after placing
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [], couponCode: null, appliedOffer: null } });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function myOrders(req, res, next) {
  try {
    const items = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function getMyOrder(req, res, next) {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

