const express = require("express");
const User = require("../models/User");
const { generateToken, protect } = require("../middleware/auth");

const router = express.Router();

// ===================== SIGNUP =====================
// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const {
      fullName, email, password, role, phone, department,
      rollNumber, year, designation, facultyId,
      researchDomain, supervisor, adminCode,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Validate admin code
    if (role === "admin" && adminCode !== "CAMPUSBUZZ-ADMIN-2025") {
      return res.status(400).json({
        success: false,
        message: "Invalid admin authorization code.",
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      role,
      phone,
      department,
      rollNumber,
      year,
      designation,
      facultyId,
      researchDomain,
      supervisor,
      adminCode,
      isVerified: role !== "admin", // Admins need manual verification
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!`,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    console.error("Signup Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

// ===================== LOGIN =====================
// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check role match
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `This account is registered as ${user.role}, not ${role}.`,
      });
    }

    // Check admin verification
    if (user.role === "admin" && !user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Admin account is pending verification.",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        rollNumber: user.rollNumber,
        year: user.year,
        designation: user.designation,
        facultyId: user.facultyId,
        researchDomain: user.researchDomain,
        supervisor: user.supervisor,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

// ===================== GET CURRENT USER =====================
// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      rollNumber: user.rollNumber,
      year: user.year,
      designation: user.designation,
      facultyId: user.facultyId,
      researchDomain: user.researchDomain,
      supervisor: user.supervisor,
      interests: user.interests,
      createdAt: user.createdAt,
    },
  });
});

// ===================== UPDATE PROFILE =====================
// PUT /api/auth/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const allowedFields = [
      "fullName", "phone", "department", "interests",
      "rollNumber", "year", "designation", "facultyId",
      "researchDomain", "supervisor",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
});

module.exports = router;
