import dotenv from "dotenv";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Company from "../models/Company.js";
import Disease from "../models/Disease.js";
import Medicine from "../models/Medicine.js";
import Offer from "../models/Offer.js";
import User from "../models/User.js";

dotenv.config({});

async function connect() {
  await mongoose.connect(process.env.MONGO_URI);
}

async function upsertByName(Model, name, extra = {}) {
  const n = String(name).trim();
  const existing = await Model.findOne({ name: n });
  if (existing) return existing;
  return Model.create({ name: n, ...extra });
}

async function seed() {
  console.log("Seeding...");

  // admin user
  const adminEmail = "admin@store.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await User.hashPassword("Admin@123");
    await User.create({ name: "Admin", email: adminEmail, passwordHash, role: "admin" });
    console.log("Created admin user: admin@store.com / Admin@123");
  } else {
    console.log("Admin user already exists");
  }

  // categories
  const catPain = await upsertByName(Category, "Pain Relief");
  const catCold = await upsertByName(Category, "Cold & Cough");
  const catSkin = await upsertByName(Category, "Skin Care");
  const catVitamins = await upsertByName(Category, "Vitamins");

  // diseases
  const disFever = await upsertByName(Disease, "Fever");
  const disCold = await upsertByName(Disease, "Common Cold");
  const disHeadache = await upsertByName(Disease, "Headache");
  const disAllergy = await upsertByName(Disease, "Allergy");

  // companies
  const compA = await upsertByName(Company, "HealthPlus Pharma", { website: "https://example.com" });
  const compB = await upsertByName(Company, "CareCure Labs", { website: "https://example.com" });
  const compC = await upsertByName(Company, "MediLife", { website: "https://example.com" });

  // medicines (insert only if empty)
  const medCount = await Medicine.countDocuments();
  if (medCount === 0) {
    await Medicine.insertMany([
      {
        name: "Paracetamol 500mg",
        type: "tablet",
        description: "Helps reduce fever and relieve mild to moderate pain. Take as directed and avoid exceeding the daily limit.",
        category: catPain._id,
        diseases: [disFever._id, disHeadache._id],
        company: compA._id,
        mrp: 30,
        price: 24,
        stockQty: 250,
        requiresPrescription: false,
        composition: "Paracetamol",
        dosage: "500mg",
      },
      {
        name: "Ibuprofen 400mg",
        type: "tablet",
        description: "Anti-inflammatory pain relief for headache and body pain. Take after food to reduce stomach upset.",
        category: catPain._id,
        diseases: [disHeadache._id],
        company: compB._id,
        mrp: 60,
        price: 52,
        stockQty: 180,
        requiresPrescription: false,
        composition: "Ibuprofen",
        dosage: "400mg",
      },
      {
        name: "Cough Syrup DX",
        type: "syrup",
        description: "Provides symptomatic relief for dry cough. Do not drive if it causes drowsiness.",
        category: catCold._id,
        diseases: [disCold._id],
        company: compC._id,
        mrp: 120,
        price: 99,
        stockQty: 90,
        requiresPrescription: false,
        composition: "Dextromethorphan",
        dosage: "10ml",
      },
      {
        name: "Cetirizine 10mg",
        type: "tablet",
        description: "Common anti-allergy tablet for sneezing/runny nose/itching. May cause mild sleepiness in some people.",
        category: catCold._id,
        diseases: [disAllergy._id],
        company: compA._id,
        mrp: 45,
        price: 38,
        stockQty: 140,
        requiresPrescription: false,
        composition: "Cetirizine",
        dosage: "10mg",
      },
      {
        name: "Vitamin C 1000mg",
        type: "tablet",
        description: "Daily vitamin support for immunity. Take with water; if you have gastritis, consider after meals.",
        category: catVitamins._id,
        diseases: [],
        company: compB._id,
        mrp: 199,
        price: 169,
        stockQty: 75,
        requiresPrescription: false,
        composition: "Ascorbic Acid",
        dosage: "1000mg",
      },
      {
        name: "Antibiotic Capsule AZ",
        type: "capsule",
        description: "Prescription-only antibiotic. Complete the full course as prescribed by your doctor.",
        category: catCold._id,
        diseases: [disCold._id],
        company: compC._id,
        mrp: 220,
        price: 210,
        stockQty: 60,
        requiresPrescription: true,
        composition: "Azithromycin",
        dosage: "250mg",
      },
      {
        name: "Skin Ointment Care",
        type: "ointment",
        description: "Soothing ointment for minor skin irritation and dryness. Apply a thin layer on clean skin.",
        category: catSkin._id,
        diseases: [],
        company: compA._id,
        mrp: 110,
        price: 89,
        stockQty: 50,
        requiresPrescription: false,
        composition: "Aloe + Zinc",
        dosage: "15g",
      },
    ]);
    console.log("Inserted sample medicines");
  } else {
    console.log("Medicines already exist, skipping insertMany");
  }

  // Ensure descriptions exist (for existing DBs seeded earlier)
  const descriptionByName = {
    "Paracetamol 500mg":
      "Helps reduce fever and relieve mild to moderate pain. Take as directed and avoid exceeding the daily limit.",
    "Ibuprofen 400mg":
      "Anti-inflammatory pain relief for headache and body pain. Take after food to reduce stomach upset.",
    "Cough Syrup DX": "Provides symptomatic relief for dry cough. Do not drive if it causes drowsiness.",
    "Cetirizine 10mg":
      "Common anti-allergy tablet for sneezing/runny nose/itching. May cause mild sleepiness in some people.",
    "Vitamin C 1000mg": "Daily vitamin support for immunity. Take with water; if you have gastritis, consider after meals.",
    "Antibiotic Capsule AZ": "Prescription-only antibiotic. Complete the full course as prescribed by your doctor.",
    "Skin Ointment Care": "Soothing ointment for minor skin irritation and dryness. Apply a thin layer on clean skin.",
  };
  await Promise.all(
    Object.entries(descriptionByName).map(([name, description]) =>
      Medicine.updateOne({ name, $or: [{ description: { $exists: false } }, { description: "" }, { description: null }] }, { $set: { description } })
    )
  );

  // Ensure images exist (name-based)
  const imagesByName = {
    "Paracetamol 500mg": [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=60",
    ],
    "Ibuprofen 400mg": [
      "https://images.unsplash.com/photo-1616671276441-2f2b3a1e2b03?auto=format&fit=crop&w=800&q=60",
    ],
    "Cough Syrup DX": [
      "https://images.unsplash.com/photo-1584367369853-8b966cf223fd?auto=format&fit=crop&w=800&q=60",
    ],
    "Cetirizine 10mg": [
      "https://images.unsplash.com/photo-1626716493137-b67fe950b1b3?auto=format&fit=crop&w=800&q=60",
    ],
    "Vitamin C 1000mg": [
      "https://images.unsplash.com/photo-1615485925873-8f4a51b1c8b2?auto=format&fit=crop&w=800&q=60",
    ],
    "Antibiotic Capsule AZ": [
      "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=60",
    ],
    "Skin Ointment Care": [
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=60",
    ],
  };
  await Promise.all(
    Object.entries(imagesByName).map(([name, images]) =>
      Medicine.updateOne(
        { name, $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] },
        { $set: { images } }
      )
    )
  );

  // offers
  const offerCount = await Offer.countDocuments();
  if (offerCount === 0) {
    await Offer.insertMany([
      {
        title: "WELCOME10",
        description: "10% off on minimum cart ₹199",
        discountPercent: 10,
        couponCode: "WELCOME10",
        isActive: true,
        appliesToAll: true,
        minCartAmount: 199,
        maxDiscountAmount: 150,
      },
      {
        title: "VITAMINS15",
        description: "15% off on Vitamins category",
        discountPercent: 15,
        couponCode: "VITAMINS15",
        isActive: true,
        appliesToAll: false,
        categories: [catVitamins._id],
        minCartAmount: 0,
        maxDiscountAmount: 200,
      },
    ]);
    console.log("Inserted sample offers");
  } else {
    console.log("Offers already exist, skipping insertMany");
  }

  console.log("Seed complete.");
}

await connect();
try {
  await seed();
} finally {
  await mongoose.disconnect();
}

