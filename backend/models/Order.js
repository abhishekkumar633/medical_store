import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    name: { type: String, required: true, trim: true }, // snapshot
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }, // snapshot
    requiresPrescription: { type: Boolean, default: false },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], required: true },

    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },

    offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    couponCode: { type: String, trim: true, uppercase: true },

    paymentMethod: { type: String, enum: ["ONLINE", "COD"], required: true, index: true },
    paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING", index: true },
    orderStatus: {
      type: String,
      enum: ["PLACED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "ON_HOLD"],
      default: "PLACED",
      index: true,
    },

    shippingAddress: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

