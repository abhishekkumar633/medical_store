import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendMail } from "../utils/mailer.js";

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

export async function forgotPassword(req, res, next) {
  try {
    const email = String(req.body?.email || "")
      .toLowerCase()
      .trim();

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email }).select("+resetPasswordTokenHash +resetPasswordExpiresAt");
    if (!user || !user.isActive) return res.json({ ok: true });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpiresAt = expiresAt;
    await user.save();

    const clientBase = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientBase}/reset-password?token=${rawToken}`;
    await sendMail({
      to: user.email,
      subject: "Reset your password",
      text: `Hi ${user.name}, use this link to reset your password: ${resetUrl}. The link expires in 30 minutes.`,
      html: `<p>Hi ${user.name},</p><p>Use this link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 30 minutes.</p>`,
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const token = String(req.body?.token || "").trim();
    const password = String(req.body?.password || "");
    if (!token || !password) return res.status(400).json({ message: "Token and password are required" });
    if (password.length < 6) return res.status(400).json({ message: "Password too short" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
      isActive: true,
    }).select("+resetPasswordTokenHash +resetPasswordExpiresAt +passwordHash");

    if (!user) return res.status(400).json({ message: "Invalid or expired reset link" });

    user.passwordHash = await User.hashPassword(password);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    res.json({ ok: true, message: "Password has been reset successfully" });
  } catch (err) {
    next(err);
  }
}

