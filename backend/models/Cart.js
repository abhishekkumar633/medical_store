import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }, // snapshot at add-to-cart time
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    items: { type: [cartItemSchema], default: [] },
    appliedOffer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    couponCode: { type: String, trim: true, uppercase: true },
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);

