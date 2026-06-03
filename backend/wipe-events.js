const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });
const Event = require("./models/Event");

async function wipeEvents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for wiping events...");

    const result = await Event.deleteMany({});

    console.log(`Wipe complete. Deleted ${result.deletedCount} events.`);
    process.exit(0);
  } catch (error) {
    console.error("Error during wipe:", error);
    process.exit(1);
  }
}

wipeEvents();
