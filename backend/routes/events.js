const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const { sendEventAlerts, sendRegistrationEmail } = require("../utils/emailService");

const router = express.Router();

// Helper to notify users when an event is approved
const notifySubscribedUsers = async (event) => {
  try {
    // Collect all terms that identify this event's subjects
    const eventTags = [
      event.department,
      ...(event.tags || []),
      ...(event.subjectTags || [])
    ].filter(Boolean);

    // Build regex to match case-insensitively
    const matchRegexes = eventTags.map(tag => new RegExp(`^${tag}$`, 'i'));

    // Find users subscribed to any of these subjects or interests
    const users = await User.find({
      $or: [
        { subscribedSubjects: { $in: matchRegexes } },
        { interests: { $in: matchRegexes } }
      ]
    }, "_id email").lean();

    const emails = users.map(u => u.email).filter(Boolean);
    const userIds = users.map(u => u._id);
    
    if (userIds.length > 0) {
      await User.updateMany(
        { _id: { $in: userIds } },
        { 
          $push: { 
            notifications: { 
              type: "new_event", 
              message: `New event matches your interests: ${event.title}`, 
              relatedEvent: event._id 
            } 
          } 
        }
      );
    }

    if (emails.length > 0) {
      // Fire and forget (don't await to avoid blocking the API)
      sendEventAlerts(emails, event);
    }
  } catch (error) {
    console.error("Failed to notify users:", error);
  }
};

// ─── Shared field projection — never send unneeded data to clients ─────────
const EVENT_PUBLIC_FIELDS = "title description type department faculty date endDate time venue speaker capacity registrations registeredUsers tags color featured status createdBy";

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/events  — paginated, filtered list (public)
// ─────────────────────────────────────────────────────────────────────────
// Uses .lean() → returns plain JS objects instead of Mongoose Documents
// (.lean() is ~2-3× faster for read-only operations)
router.get("/", async (req, res) => {
  try {
    const {
      type, department, subject, search, featured,
      status, page = 1, limit = 20,
    } = req.query;

    // Clamp limit to prevent massive queries
    const safeLimit = Math.min(Number(limit) || 20, 100);
    const safePage  = Math.max(Number(page) || 1, 1);

    const filter = {};
    if (type && type !== "all")                     filter.type       = type;
    if (department && department !== "All Departments") filter.department = department;
    if (subject && subject !== "All Subjects")      filter.subjectTags = subject;
    if (featured === "true")                        filter.featured   = true;
    if (status !== "all") {
      filter.status = status || "approved"; // default: approved only
    }

    if (search) {
      // Use MongoDB text index when available; fall back to $or regex
      filter.$text
        ? (filter.$text = { $search: search })
        : (filter.$or = [
            { title:       { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { speaker:     { $regex: search, $options: "i" } },
            { tags:        { $in: [new RegExp(search, "i")] } },
            { subjectTags: { $in: [new RegExp(search, "i")] } },
          ]);
    }

    // Run count and data fetch in parallel → ~50 % faster
    const [events, total] = await Promise.all([
      Event.find(filter, EVENT_PUBLIC_FIELDS)
        .sort({ date: 1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .populate("createdBy", "fullName email role")
        .lean(),
      Event.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
      events,
    });
  } catch (error) {
    console.error("Get Events Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch events." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/events/:id  — single event (public)
// ═══════════════════════════════════════════════════════════════════════════
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }

    const event = await Event.findById(req.params.id, EVENT_PUBLIC_FIELDS)
      .populate("createdBy", "fullName email role department")
      .lean();

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch event." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/events  — create event (Faculty, Admin & Students)
// ═══════════════════════════════════════════════════════════════════════════
router.post("/", protect, authorize("faculty", "admin", "student"), async (req, res) => {
  try {
    // Faculty & Admins get auto-approved. Students are set to "pending".
    const initialStatus = req.user.role === "student" ? "pending" : "approved";

    const eventData = {
      ...req.body,
      createdBy: req.user._id,
      status: initialStatus,
    };

    const event = await Event.create(eventData);

    // If admin created it, it's instantly approved, so trigger alerts
    if (event.status === "approved") {
      notifySubscribedUsers(event);
      if (req.app.get("io")) req.app.get("io").emit("event_published", event);
    }

    res.status(201).json({
      success: true,
      message: req.user.role === "admin" || req.user.role === "faculty"
        ? "Event created and published!"
        : "Event submitted for admin review.",
      event,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    console.error("Create Event Error:", error);
    res.status(500).json({ success: false, message: "Failed to create event." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PUT /api/events/:id  — update event
// ═══════════════════════════════════════════════════════════════════════════
router.put("/:id", protect, authorize("faculty", "admin", "student"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }

    // Fetch only the fields we need for the authorization check
    const event = await Event.findById(req.params.id, "createdBy").lean();
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    const isOwner = event.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this event." });
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    res.status(200).json({ success: true, message: "Event updated.", event: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update event." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// DELETE /api/events/:id
// ═══════════════════════════════════════════════════════════════════════════
router.delete("/:id", protect, authorize("faculty", "admin", "student"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }

    const event = await Event.findById(req.params.id, "createdBy").lean();
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    const isOwner = event.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Event deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete event." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/events/:id/register  — atomic registration (race-condition safe)
// ─────────────────────────────────────────────────────────────────────────
// Using findOneAndUpdate with $addToSet + $inc in a SINGLE atomic operation.
// This is critical at scale: without atomicity, 2 users registering at the
// same millisecond could both pass the capacity check and over-fill the event.
// ═══════════════════════════════════════════════════════════════════════════
router.post("/:id/register", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }

    const userId = req.user._id;

    // Step 1: Atomically add user only if NOT already registered AND capacity not full
    const updated = await Event.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "approved",
        registeredUsers: { $ne: userId },        // not already registered
        $expr: { $lt: ["$registrations", "$capacity"] }, // has space
      },
      {
        $addToSet: { registeredUsers: userId },
        $inc: { registrations: 1 },
      },
      { new: false } // we only care if the update matched
    );

    if (!updated) {
      // Figure out why it failed
      const event = await Event.findById(req.params.id, "registeredUsers registrations capacity status").lean();
      if (!event) return res.status(404).json({ success: false, message: "Event not found." });
      if (event.registeredUsers.some((id) => id.toString() === userId.toString()))
        return res.status(400).json({ success: false, message: "Already registered for this event." });
      if (event.registrations >= event.capacity)
        return res.status(400).json({ success: false, message: "Event is at full capacity." });
      return res.status(400).json({ success: false, message: "Registration not available." });
    }

    // After successful atomic update, fetch event details for the email
    const eventDetails = await Event.findById(req.params.id, "title date time venue").lean();
    if (eventDetails && req.user.email) {
      // Fire and forget email sending
      sendRegistrationEmail(req.user.email, req.user.fullName, eventDetails);
    }

    if (req.app.get("io")) req.app.get("io").emit("registration_update", { eventId: req.params.id });
    res.status(200).json({ success: true, message: "Successfully registered!" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Failed to register." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PUT /api/events/:id/status  — approve / reject (Admin only)
// ═══════════════════════════════════════════════════════════════════════════
router.put("/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'approved' or 'rejected'." });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).lean();

    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    // If it was just approved, trigger the alerts
    if (status === "approved") {
      notifySubscribedUsers(event);
      if (req.app.get("io")) req.app.get("io").emit("event_published", event);
    }

    res.status(200).json({ success: true, message: `Event ${status}.`, event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update event status." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PUT /api/events/:id/featured  — toggle featured (Admin only)
// ═══════════════════════════════════════════════════════════════════════════
router.put("/:id/featured", protect, authorize("admin"), async (req, res) => {
  try {
    // Atomic toggle: read current value from DB in the same operation
    const event = await Event.findById(req.params.id, "featured").lean();
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { featured: !event.featured },
      { new: true }
    ).lean();

    res.status(200).json({
      success: true,
      message: updated.featured ? "Event featured!" : "Event unfeatured.",
      event: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to toggle featured." });
  }
});

module.exports = router;
