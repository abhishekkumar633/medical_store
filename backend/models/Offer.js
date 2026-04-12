import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    discountPercent: { type: Number, required: true, min: 0, max: 100 },
    couponCode: { type: String, trim: true, uppercase: true, unique: true, sparse: true },

    activeFrom: { type: Date },
    activeTo: { type: Date },
    isActive: { type: Boolean, default: true, index: true },

    appliesToAll: { type: Boolean, default: true },
    medicineTypes: [
      {
        type: String,
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
      },
    ],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    medicines: [{ type: mongoose.Schema.Types.ObjectId, ref: "Medicine" }],

    minCartAmount: { type: Number, min: 0, default: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Offer", offerSchema);

