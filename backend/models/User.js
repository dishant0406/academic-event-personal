const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      required: [true, "Role is required"],
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
    },

    // Student-specific fields
    rollNumber: { type: String },
    year: { type: String },
    researchDomain: { type: String }, // Optional for non-PhD students
    supervisor: { type: String }, // Optional for non-PhD students

    // Faculty-specific fields
    designation: { type: String },
    facultyId: { type: String },

    // Admin-specific fields
    adminCode: { type: String, select: false },
    isVerified: { type: Boolean, default: false },

    // Password Reset fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Common
    interests: [String],
    subscribedSubjects: [String],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    notifications: [{
      type: { type: String, enum: ["info", "reminder", "approval", "rejection", "new_event"] },
      message: String,
      read: { type: Boolean, default: false },
      date: { type: Date, default: Date.now },
      relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }
    }],
    avatar: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const user = this;
  const salt = await new Promise((resolve, reject) =>
    bcrypt.genSalt(12, (err, s) => (err ? reject(err) : resolve(s)))
  );
  user.password = await new Promise((resolve, reject) =>
    bcrypt.hash(user.password, salt, (err, h) => (err ? reject(err) : resolve(h)))
  );
});

// Compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// ─── Indexes ──────────────────────────────────────────────────────────────
// Note: email already has a unique index via { unique: true } on the field.
// role index for admin dashboards that filter all users by role.
userSchema.index({ role: 1 });


module.exports = mongoose.model("User", userSchema);

