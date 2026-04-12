import mongoose from "mongoose";

const customerMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    type: { type: String, enum: ["PRICE_CHANGE", "PRESCRIPTION_QUERY", "CALL_REQUEST", "GENERAL"], default: "GENERAL", index: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true, trim: true },

    status: { type: String, enum: ["OPEN", "IN_PROGRESS", "CLOSED"], default: "OPEN", index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolutionNote: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("CustomerMessage", customerMessageSchema);

