const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;

if (!uri) {
  console.log("❌ MONGO_URI is not loaded");
  process.exit(1);
}

const client = new MongoClient(uri);

async function testConnection() {
  try {
    console.log("Connecting to MongoDB Atlas...");

    await client.connect();

    await client.db("admin").command({ ping: 1 });

    console.log("✅ MONGODB ATLAS CONNECTION SUCCESS!");
  } catch (error) {
    console.log("❌ CONNECTION FAILED");
    console.log(error.message);
  } finally {
    await client.close();
  }
}

testConnection();