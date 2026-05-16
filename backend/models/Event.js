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

// Index for search
eventSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Event", eventSchema);
