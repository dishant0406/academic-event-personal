/**
 * CampusBuzz API Server — Production-grade, 10 000-concurrent-user capable
 *
 * Architecture highlights
 * ─────────────────────────────────────────────────────────────────────────
 *  • Node.js Cluster   – one worker per logical CPU core (true multi-core)
 *  • Rate Limiting     – per-IP, global + strict login/signup limits
 *  • Compression       – gzip/brotli on all responses (≈70 % bandwidth cut)
 *  • Helmet            – security headers (XSS, MIME sniff, clickjacking…)
 *  • Morgan            – structured request logging (skips /health checks)
 *  • MongoDB pool      – max 100 connections per worker
 *  • Graceful shutdown – drains connections before restarting
 */

"use strict";

const cluster = require("cluster");
const os = require("os");
const process = require("process");

// ─── CLUSTER: primary forks one worker per CPU ────────────────────────────
if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`\n⚡ CampusBuzz Master  PID=${process.pid}  CPUs=${numCPUs}`);
  console.log(`   Spawning ${numCPUs} worker(s)…\n`);

  for (let i = 0; i < numCPUs; i++) cluster.fork();

  cluster.on("exit", (worker, code, signal) => {
    console.warn(`⚠️  Worker ${worker.process.pid} died (${signal || code}). Restarting…`);
    cluster.fork(); // auto-restart crashed workers
  });

} else {
  // ─── WORKER: each worker runs its own Express app + DB connection ─────
  startWorker();
}

// ═══════════════════════════════════════════════════════════════════════════
async function startWorker() {
  const express      = require("express");
  const cors         = require("cors");
  const cookieParser = require("cookie-parser");
  const helmet       = require("helmet");
  const compression  = require("compression");
  const morgan       = require("morgan");
  const rateLimit    = require("express-rate-limit");
  const dotenv       = require("dotenv");
  const { connectDB, closeDB } = require("./config/db");

  dotenv.config();

  // ── Connect to MongoDB ────────────────────────────────────────────────
  await connectDB();

  const app = express();

  // ── Trust proxy (NGINX / load balancer in front) ──────────────────────
  app.set("trust proxy", 1);

  // ── Security headers ──────────────────────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // API-only; no HTML served
  }));

  // ── Gzip / Brotli compression — cuts payload size ~70 % ───────────────
  app.use(compression({ level: 6 }));

  // ── Body parser — tighten limit; 10 MB is too generous for an API ─────
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // ── Cookie parser ─────────────────────────────────────────────────────
  app.use(cookieParser());

  // ── CORS ──────────────────────────────────────────────────────────────
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim());

  app.use(cors({
    origin: (origin, cb) => {
      // Allow server-to-server calls (no origin) or whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // Cache preflight for 24 h
  }));

  // ── Structured request logging ─────────────────────────────────────────
  // Skip /health pings so logs aren't flooded by load-balancer probes
  app.use(morgan("combined", {
    skip: (req) => req.path === "/api/health",
  }));

  // ══════════════════════════ RATE LIMITING ══════════════════════════════
  // Global limiter — protects every route
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,                  // 500 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please slow down." },
  });
  app.use(globalLimiter);

  // Strict limiter — login & signup (brute-force protection)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,                   // 20 auth attempts per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many auth attempts. Try again in 15 minutes." },
  });
  app.use("/api/auth/login",  authLimiter);
  app.use("/api/auth/signup", authLimiter);

  // ══════════════════════════════ ROUTES ════════════════════════════════
  app.use("/api/auth",   require("./routes/auth"));
  app.use("/api/events", require("./routes/events"));
  app.use("/api/users",  require("./routes/users"));

  // Health check — lightweight, responds instantly, no DB call
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      success: true,
      message: "⚡ CampusBuzz API is running",
      worker: process.pid,
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage().rss,
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  });

  // Global error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => {
    // CORS errors
    if (err.message && err.message.startsWith("CORS blocked")) {
      return res.status(403).json({ success: false, message: err.message });
    }
    console.error(`[Worker ${process.pid}] Error:`, err);
    res.status(err.status || 500).json({
      success: false,
      message: process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    });
  });

  // ══════════════════════════ START SERVER ══════════════════════════════
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`✅ Worker ${process.pid} listening on port ${PORT}`);
  });

  // ─── Tune keep-alive for high concurrency ─────────────────────────────
  server.keepAliveTimeout    = 65_000; // > NGINX default 60 s
  server.headersTimeout      = 66_000;
  server.maxConnections      = 10_000; // OS-level socket limit per worker

  // ─── Graceful shutdown on SIGTERM / SIGINT ────────────────────────────
  const gracefulShutdown = async (signal) => {
    console.log(`\n[Worker ${process.pid}] ${signal} received — shutting down gracefully…`);
    server.close(async () => {
      await closeDB();
      console.log(`[Worker ${process.pid}] Shutdown complete.`);
      process.exit(0);
    });

    // Force kill if shutdown takes > 10 s
    setTimeout(() => {
      console.error(`[Worker ${process.pid}] Forced shutdown after 10 s`);
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT",  () => gracefulShutdown("SIGINT"));
}
