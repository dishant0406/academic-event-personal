const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });
const User = require("./models/User");

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for cleanup");

    const result = await User.updateMany(
      { role: "faculty" },
      { $unset: { rollNumber: "", year: "" } }
    );

    console.log(`Cleanup complete. Modified ${result.modifiedCount} faculty documents.`);
    process.exit(0);
  } catch (error) {
    console.error("Error during cleanup:", error);
    process.exit(1);
  }
}

cleanup();
