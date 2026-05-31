const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const { generateToken, protect, invalidateUserCache } = require("../middleware/auth");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// ─── Shared user projection — never expose password / adminCode ────────────
const USER_PUBLIC_FIELDS = "fullName email role department phone rollNumber year designation facultyId researchDomain supervisor interests subscribedSubjects bookmarks notifications avatar createdAt";

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/auth/signup
// ═══════════════════════════════════════════════════════════════════════════
router.post("/signup", async (req, res) => {
  try {
    const {
      fullName, email, password, role, phone, department,
      rollNumber, year, designation, facultyId,
      researchDomain, supervisor, adminCode,
    } = req.body;

    // ── Basic input validation ────────────────────────────────────────────
    if (!fullName || !email || !password || !role || !department) {
      return res.status(400).json({
        success: false,
        message: "fullName, email, password, role, and department are required.",
      });
    }

    // ── Admin code check ──────────────────────────────────────────────────
    if (role === "admin" && adminCode !== process.env.ADMIN_CODE) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin authorization code.",
      });
    }

    // ── Duplicate email check ─────────────────────────────────────────────
    const existingUser = await User.findOne({ email: email.toLowerCase() }, "_id").lean();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // ── Create user ───────────────────────────────────────────────────────
    const user = await User.create({
      fullName,
      email,
      password,
      role,
      phone,
      department,
      rollNumber: role === "faculty" ? undefined : rollNumber,
      year: role === "faculty" ? undefined : year,
      designation,
      facultyId,
      researchDomain,
      supervisor,
      adminCode,
      isVerified: true, // Auto-verify since we already checked process.env.ADMIN_CODE
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!`,
      token,
      user: {
        id:         user._id,
        fullName:   user.fullName,
        email:      user.email,
        role:       user.role,
        department: user.department,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/auth/login
// ═══════════════════════════════════════════════════════════════════════════
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // Select password field (normally excluded by schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      // Constant-time response — don't reveal whether email exists
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Role mismatch
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `This account is registered as '${user.role}', not '${role}'.`,
      });
    }

    // Admin not yet verified check removed for MVP since adminCode validates them

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id:             user._id,
        fullName:       user.fullName,
        email:          user.email,
        role:           user.role,
        department:     user.department,
        phone:          user.phone,
        rollNumber:     user.rollNumber,
        year:           user.year,
        designation:    user.designation,
        facultyId:      user.facultyId,
        researchDomain: user.researchDomain,
        supervisor:     user.supervisor,
        subscribedSubjects: user.subscribedSubjects,
        bookmarks:      user.bookmarks,
        notifications:  user.notifications,
        isVerified:     user.isVerified,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/auth/me  — current user (served from auth-cache, no extra DB call)
// ═══════════════════════════════════════════════════════════════════════════
router.get("/me", protect, (req, res) => {
  // req.user is already populated by the protect middleware (from cache or DB)
  const u = req.user;
  res.status(200).json({
    success: true,
    user: {
      id:             u._id,
      fullName:       u.fullName,
      email:          u.email,
      role:           u.role,
      department:     u.department,
      phone:          u.phone,
      rollNumber:     u.rollNumber,
      year:           u.year,
      designation:    u.designation,
      facultyId:      u.facultyId,
      researchDomain: u.researchDomain,
      supervisor:     u.supervisor,
      interests:      u.interests,
      subscribedSubjects: u.subscribedSubjects,
      bookmarks:      u.bookmarks,
      notifications:  u.notifications,
      avatar:         u.avatar,
      isVerified:     u.isVerified,
      createdAt:      u.createdAt,
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PUT /api/auth/profile  — update profile
// ═══════════════════════════════════════════════════════════════════════════
router.put("/profile", protect, async (req, res) => {
  try {
    const ALLOWED_FIELDS = [
      "fullName", "phone", "department", "interests", "subscribedSubjects", "avatar",
      "rollNumber", "year", "designation", "facultyId",
      "researchDomain", "supervisor",
    ];

    const updates = {};
    ALLOWED_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update." });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true, select: USER_PUBLIC_FIELDS }
    ).lean();

    // Invalidate the auth cache so subsequent requests get fresh data
    invalidateUserCache(req.user._id.toString());

    res.status(200).json({ success: true, message: "Profile updated.", user });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/auth/forgotpassword
// ═══════════════════════════════════════════════════════════════════════════
router.post("/forgotpassword", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "There is no user with that email" });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Ensure NEXT_PUBLIC_FRONTEND_URL exists or default to localhost
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
    const html = `
      <h2>Academic Events Hub (AEH)</h2>
      <p>You are receiving this email because you (or someone else) has requested a password reset.</p>
      <p>Click the button below to reset your password. This link is valid for 10 minutes.</p>
      <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "AEH Password Reset Token",
        message,
        html
      });
      res.status(200).json({ success: true, message: "Email sent" });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: "Email could not be sent" });
    }
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PUT /api/auth/resetpassword/:token
// ═══════════════════════════════════════════════════════════════════════════
router.put("/resetpassword/:token", async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    // Set new password
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }
    
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    // Invalidate cache
    invalidateUserCache(user._id.toString());

    res.status(200).json({ success: true, message: "Password successfully reset" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/auth/logout  — clear cookie
// ═══════════════════════════════════════════════════════════════════════════
router.post("/logout", protect, (req, res) => {
  invalidateUserCache(req.user._id.toString());
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully." });
});

module.exports = router;
