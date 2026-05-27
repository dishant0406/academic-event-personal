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

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/users/dashboard  — Dashboard data (registered, recommended, bookmarks)
// ═══════════════════════════════════════════════════════════════════════════
router.get("/dashboard", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 1. Registered Events
    const registeredEvents = await Event.find({ registeredUsers: userId }).lean();
    
    // 2. Bookmarked Events
    const user = await User.findById(userId).populate("bookmarks").lean();
    const bookmarkedEvents = user.bookmarks || [];
    
    // 3. Recommended Events
    const subjects = user.subscribedSubjects || [];
    let query = { status: "approved", date: { $gte: new Date() } };
    
    let recommendedEvents = [];
    if (subjects.length > 0) {
      query.$or = [
        { department: { $in: subjects.map(s => new RegExp(s, 'i')) } },
        { tags: { $in: subjects.map(s => new RegExp(s, 'i')) } },
        { subjectTags: { $in: subjects.map(s => new RegExp(s, 'i')) } }
      ];
      recommendedEvents = await Event.find(query).sort({ date: 1 }).limit(6).lean();
    }
    
    // Fallback if no specific recommendations found
    if (recommendedEvents.length === 0) {
      recommendedEvents = await Event.find({ status: "approved", date: { $gte: new Date() } })
        .sort({ date: 1 })
        .limit(6)
        .lean();
    }

    res.status(200).json({
      success: true,
      registeredEvents,
      bookmarkedEvents,
      recommendedEvents
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data." });
  }
});

module.exports = router;
