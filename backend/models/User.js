const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
      enum: ["student", "faculty", "scholar", "admin"],
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

    // Faculty-specific fields
    designation: { type: String },
    facultyId: { type: String },

    // Scholar-specific fields
    researchDomain: { type: String },
    supervisor: { type: String },

    // Admin-specific fields
    adminCode: { type: String, select: false },
    isVerified: { type: Boolean, default: false },

    // Common
    interests: [String],
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

// ─── Indexes ──────────────────────────────────────────────────────────────
// Note: email already has a unique index via { unique: true } on the field.
// role index for admin dashboards that filter all users by role.
userSchema.index({ role: 1 });


module.exports = mongoose.model("User", userSchema);

