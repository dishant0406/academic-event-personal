"use strict";

const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const helmet       = require("helmet");
const compression  = require("compression");
const morgan       = require("morgan");
const rateLimit    = require("express-rate-limit");
const dotenv       = require("dotenv");
const mongoose     = require("mongoose");
dotenv.config();

const app = express();

// Ensure DB connection for Serverless environments (Vercel)
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const uri = process.env.MONGODB_URI && process.env.MONGODB_URI.includes("imashish412_db_user") && !process.env.MONGODB_URI.includes("<db_password>") 
        ? process.env.MONGODB_URI 
        : "mongodb://imashish412_db_user:ashish1712@ac-ajcq3fv-shard-00-00.mmhmxki.mongodb.net:27017,ac-ajcq3fv-shard-00-01.mmhmxki.mongodb.net:27017,ac-ajcq3fv-shard-00-02.mmhmxki.mongodb.net:27017/campusbuzz?ssl=true&replicaSet=atlas-d2tpbz-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";
      
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4 (Vercel Serverless fix)
      });
    }
    next();
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    res.status(500).json({ success: false, message: "Database connection failed", error: error.message });
  }
});

// Trust proxy for rate limiting (Vercel uses proxies)
app.set("trust proxy", 1);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

// Compression
app.use(compression({ level: 6 }));

// Body parser
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Cookie parser
app.use(cookieParser());

// CORS configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server calls or whitelisted origins
    if (!origin || allowedOrigins.includes(origin) || origin.includes("vercel.app")) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
}));

// Structured request logging
app.use(morgan("combined", {
  skip: (req) => req.path === "/api/health",
}));

// Global Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
});
app.use(globalLimiter);

// Routes
app.use("/api/auth",      require("./routes/auth"));
app.use("/api/events",    require("./routes/events"));
app.use("/api/users",     require("./routes/users"));
app.use("/api/analytics", require("./routes/analytics"));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "⚡ Academic Events Hub (AEH) API is running on Vercel Serverless",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, _next) => {
  if (err.message && err.message.startsWith("CORS blocked")) {
    return res.status(403).json({ success: false, message: err.message });
  }
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
});

// Export the app for Vercel Serverless deployment
module.exports = app;

// If running locally, listen on a port
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running locally on port ${PORT}`);
  });
}
