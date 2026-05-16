const express = require("express");
const Event = require("../models/Event");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// ===================== GET ALL EVENTS (public) =====================
// GET /api/events
router.get("/", async (req, res) => {
  try {
    const { type, department, search, featured, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (type && type !== "all") filter.type = type;
    if (department && department !== "All Departments") filter.department = department;
    if (featured === "true") filter.featured = true;
    if (status) filter.status = status;
    else filter.status = "approved"; // Default: only show approved events

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
        { speaker: { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(filter)
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("createdBy", "fullName email role");

    const total = await Event.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      events,
    });
  } catch (error) {
    console.error("Get Events Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch events." });
  }
});

// ===================== GET SINGLE EVENT =====================
// GET /api/events/:id
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "fullName email role department");

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch event." });
  }
});

// ===================== CREATE EVENT =====================
// POST /api/events (Faculty & Admin only)
router.post("/", protect, authorize("faculty", "admin"), async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user._id,
      status: req.user.role === "admin" ? "approved" : "pending",
    };

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      message: req.user.role === "admin"
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

// ===================== UPDATE EVENT =====================
// PUT /api/events/:id
router.put("/:id", protect, authorize("faculty", "admin"), async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    // Only creator or admin can update
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this event." });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: "Event updated.", event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update event." });
  }
});

// ===================== DELETE EVENT =====================
// DELETE /api/events/:id
router.delete("/:id", protect, authorize("faculty", "admin"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Event deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete event." });
  }
});

// ===================== REGISTER FOR EVENT =====================
// POST /api/events/:id/register
router.post("/:id/register", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    if (event.registeredUsers.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: "Already registered for this event." });
    }

    if (event.registrations >= event.capacity) {
      return res.status(400).json({ success: false, message: "Event is full." });
    }

    event.registeredUsers.push(req.user._id);
    event.registrations += 1;
    await event.save();

    res.status(200).json({ success: true, message: "Successfully registered!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to register." });
  }
});

// ===================== APPROVE/REJECT EVENT (Admin) =====================
// PUT /api/events/:id/status
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
    );

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    res.status(200).json({
      success: true,
      message: `Event ${status}.`,
      event,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update event status." });
  }
});

// ===================== TOGGLE FEATURED (Admin) =====================
// PUT /api/events/:id/featured
router.put("/:id/featured", protect, authorize("admin"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    event.featured = !event.featured;
    await event.save();

    res.status(200).json({
      success: true,
      message: event.featured ? "Event featured!" : "Event unfeatured.",
      event,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to toggle featured." });
  }
});

module.exports = router;
