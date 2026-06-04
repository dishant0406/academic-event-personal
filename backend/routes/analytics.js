const express = require("express");
const Event = require("../models/Event");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/analytics/faculty  — Fetch analytics for the logged-in faculty
// ═══════════════════════════════════════════════════════════════════════════
router.get("/faculty", protect, authorize("faculty", "admin"), async (req, res) => {
  try {
    // Fetch all events created by this faculty
    const events = await Event.find({ createdBy: req.user._id })
      .select("title capacity registrations views clicks color status date")
      .sort({ date: -1 })
      .lean();

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Faculty Analytics Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch analytics." });
  }
});

module.exports = router;
