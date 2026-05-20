const mongoose = require("mongoose");

// ─── Connection Pool & Options tuned for 10 000 concurrent users ───────────
// Each Node.js worker will maintain up to 100 DB connections.
// With Node cluster (one worker per CPU core), total pool ≈ cores × 100.
const MONGO_OPTIONS = {
  maxPoolSize: 100,          // Max simultaneous open connections per worker
  minPoolSize: 10,           // Always keep 10 warm connections ready
  serverSelectionTimeoutMS: 5000,   // Fail fast if MongoDB is unreachable
  socketTimeoutMS: 45000,           // Close idle sockets after 45 s
  heartbeatFrequencyMS: 10000,      // Check server health every 10 s
  retryWrites: true,
  writeConcern: { w: "majority" },  // Ensure writes survive replica failover
};

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Pool size : max=${MONGO_OPTIONS.maxPoolSize}, min=${MONGO_OPTIONS.minPoolSize}`);

    // ── Connection event listeners ──────────────────────────────────────────
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting reconnect…");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected.");
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// ── Graceful shutdown: close pool before process exits ─────────────────────
const closeDB = async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB connection closed (graceful shutdown).");
};

module.exports = { connectDB, closeDB };
