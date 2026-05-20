const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    type: {
      type: String,
      enum: ["seminar", "workshop", "conference", "lecture", "training"],
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    faculty: {
      type: String,
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    endDate: {
      type: Date,
    },
    time: {
      type: String,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
    },
    speaker: {
      type: String,
    },
    capacity: {
      type: Number,
      default: 200,
    },
    registrations: {
      type: Number,
      default: 0,
    },
    registeredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tags: [String],
    color: {
      type: String,
      default: "#6366f1",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
// Full-text search on title, description, tags
eventSchema.index({ title: "text", description: "text", tags: "text" });

// Compound indexes matching the most common filter combinations
// (status is almost always in the query, so it leads every compound index)
eventSchema.index({ status: 1, date: 1 });             // default listing
eventSchema.index({ status: 1, type: 1, date: 1 });    // filtered by type
eventSchema.index({ status: 1, department: 1, date: 1 }); // filtered by dept
eventSchema.index({ status: 1, featured: 1, date: 1 }); // featured events
eventSchema.index({ createdBy: 1, status: 1 });        // my events (faculty)


module.exports = mongoose.model("Event", eventSchema);
