const mongoose = require("mongoose");

const uri = "mongodb://imashish412_db_user:ashish1712@ac-ajcq3fv-shard-00-00.mmhmxki.mongodb.net:27017,ac-ajcq3fv-shard-00-01.mmhmxki.mongodb.net:27017,ac-ajcq3fv-shard-00-02.mmhmxki.mongodb.net:27017/campusbuzz?ssl=true&replicaSet=atlas-d2tpbz-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function test() {
  try {
    console.log("Connecting...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ SUCCESS");
    process.exit(0);
  } catch (err) {
    console.error("❌ FAILED:", err.message);
    process.exit(1);
  }
}

test();
