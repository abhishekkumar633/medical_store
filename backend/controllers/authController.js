import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(user) {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  const expiresIn = process.env.JWT_EXPIRES || "7d";
  return jwt.sign({ sub: user._id.toString(), role: user.role }, secret, { expiresIn });
}

export async function register(req, res, next) {
  try {
    const { name, email, phone, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });
    if (String(password).length < 6) return res.status(400).json({ message: "Password too short" });

    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await User.hashPassword(String(password));
    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      phone: phone ? String(phone).trim() : undefined,
      passwordHash,
      role: "customer",
    });

    const token = signToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+passwordHash");
    if (!user || !user.isActive) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.verifyPassword(String(password));
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
}

export async function logout(req, res) {
  res.clearCookie("token");
  res.json({ ok: true });
}

