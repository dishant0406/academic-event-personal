const express = require("express");
const crypto = require("crypto");
const { Op } = require("sequelize");
const { User, sequelize } = require("../db/models");
const { generateToken, protect, invalidateUserCache } = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");
const { env } = require("../config/env");
const { APP_SHORT_NAME } = require("../config/constants");
const { getAuthCookieOptions } = require("../utils/authCookies");
const { replaceUserPreferences } = require("../utils/dbCollections");
const { serializeUser } = require("../utils/serializers");

const router = express.Router();

const userInclude = [
  { association: "preferenceItems" },
  { association: "bookmarkedEvents", attributes: ["id"], through: { attributes: [] } },
];

router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, role, phone, department, rollNumber, year, designation, facultyId, researchDomain, supervisor, adminCode } = req.body;

    if (!fullName || !email || !password || !role || !department) {
      return res.status(400).json({ success: false, message: "fullName, email, password, role, and department are required." });
    }

    if (role === "admin" && adminCode !== env.ADMIN_CODE) {
      return res.status(400).json({ success: false, message: "Invalid admin authorization code." });
    }

    const existingUser = await User.findOne({ where: { email: String(email).toLowerCase() }, attributes: ["id"] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role,
      phone,
      department,
      rollNumber: role === "faculty" ? null : rollNumber,
      year: role === "faculty" ? null : year,
      designation,
      facultyId,
      researchDomain,
      supervisor,
      isVerified: true,
    });

    const token = generateToken(user.id);
    res.cookie("token", token, getAuthCookieOptions());
    res.status(201).json({ success: true, message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!`, token, user: serializeUser(user) });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password." });
    }

    const user = await User.unscoped().findOne({ where: { email: String(email).toLowerCase() }, include: userInclude });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ success: false, message: `This account is registered as '${user.role}', not '${role}'.` });
    }

    const token = generateToken(user.id);
    res.cookie("token", token, getAuthCookieOptions());
    res.status(200).json({ success: true, message: "Login successful!", token, user: serializeUser(user) });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

router.get("/me", protect, async (req, res) => {
  const user = await User.findByPk(req.user.id, { include: userInclude });
  res.status(200).json({ success: true, user: serializeUser(user) });
});

router.put("/profile", protect, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const allowedFields = ["fullName", "phone", "department", "avatar", "rollNumber", "year", "designation", "facultyId", "researchDomain", "supervisor"];
    const updates = allowedFields.reduce((result, field) => {
      if (req.body[field] !== undefined) result[field] = req.body[field];
      return result;
    }, {});

    const currentUser = await User.findByPk(req.user.id, { include: userInclude, transaction });
    const current = serializeUser(currentUser);

    await User.update(updates, { where: { id: req.user.id }, transaction });

    if (req.body.interests !== undefined || req.body.subscribedSubjects !== undefined) {
      await replaceUserPreferences(req.user.id, req.body, transaction, current);
    }

    await transaction.commit();
    invalidateUserCache(String(req.user.id));

    const user = await User.findByPk(req.user.id, { include: userInclude });
    res.status(200).json({ success: true, message: "Profile updated.", user: serializeUser(user) });
  } catch (error) {
    await transaction.rollback();
    console.error("Profile Update Error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
});

router.post("/forgotpassword", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.unscoped().findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({ success: true, message: "If an account exists for that email, a reset link has been sent." });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `${env.FRONTEND_BASE_URL}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Use this link: ${resetUrl}`;
    const html = `<h2>${APP_SHORT_NAME}</h2><p>You requested a password reset.</p><a href="${resetUrl}">Reset Password</a>`;

    await sendEmail({ email: user.email, subject: `${APP_SHORT_NAME} Password Reset Token`, message, html });
    res.status(200).json({ success: true, message: "If an account exists for that email, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/resetpassword/:token", async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.unscoped().findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();
    invalidateUserCache(String(user.id));
    res.status(200).json({ success: true, message: "Password successfully reset" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/logout", protect, (req, res) => {
  invalidateUserCache(String(req.user.id));
  res.clearCookie("token", getAuthCookieOptions());
  res.status(200).json({ success: true, message: "Logged out successfully." });
});

module.exports = router;
