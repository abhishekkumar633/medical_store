import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "tablet",
        "capsule",
        "syrup",
        "injection",
        "ointment",
        "drops",
        "inhaler",
        "powder",
        "other",
      ],
      default: "other",
      index: true,
    },
    description: { type: String, trim: true },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true },
    diseases: [{ type: mongoose.Schema.Types.ObjectId, ref: "Disease", index: true }],
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", index: true },

    mrp: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    stockQty: { type: Number, required: true, min: 0, default: 0 },

    requiresPrescription: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    images: [{ type: String, trim: true }],

    sku: { type: String, trim: true, unique: true, sparse: true },
    composition: { type: String, trim: true },
    dosage: { type: String, trim: true },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

medicineSchema.index({ name: "text", description: "text", composition: "text" });

export default mongoose.model("Medicine", medicineSchema);

