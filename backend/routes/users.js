const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Event = require("../models/Event");
const { protect, invalidateUserCache } = require("../middleware/auth");

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/users/bookmarks/:id  — Toggle bookmark for an event
// ═══════════════════════════════════════════════════════════════════════════
router.post("/bookmarks/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }

    const eventId = req.params.id;
    const userId = req.user._id;

    // Check if event exists
    const event = await Event.findById(eventId, "_id").lean();
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    // Toggle bookmark
    const user = await User.findById(userId, "bookmarks").lean();
    const isBookmarked = user.bookmarks.some(id => id.toString() === eventId.toString());

    let updatedUser;
    if (isBookmarked) {
      // Remove bookmark
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { bookmarks: eventId } },
        { new: true }
      );
    } else {
      // Add bookmark
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { bookmarks: eventId } },
        { new: true }
      );
    }

    // Invalidate auth cache so the next /me call is fresh
    invalidateUserCache(userId.toString());

    res.status(200).json({
      success: true,
      message: isBookmarked ? "Bookmark removed." : "Event bookmarked.",
      bookmarks: updatedUser.bookmarks
    });
  } catch (error) {
    console.error("Bookmark Error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle bookmark." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PATCH /api/users/preferences  — Update subject subscriptions
// ═══════════════════════════════════════════════════════════════════════════
router.patch("/preferences", protect, async (req, res) => {
  try {
    const { subscribedSubjects } = req.body;

    if (!Array.isArray(subscribedSubjects)) {
      return res.status(400).json({ success: false, message: "subscribedSubjects must be an array." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { subscribedSubjects },
      { new: true }
    );

    invalidateUserCache(req.user._id.toString());

    res.status(200).json({
      success: true,
      message: "Preferences updated.",
      subscribedSubjects: updatedUser.subscribedSubjects
    });
  } catch (error) {
    console.error("Preferences Update Error:", error);
    res.status(500).json({ success: false, message: "Failed to update preferences." });
  }
});

module.exports = router;
