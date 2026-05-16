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
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
