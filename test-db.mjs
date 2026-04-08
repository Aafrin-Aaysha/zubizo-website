import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found");
    return;
  }
  console.log("Connecting to:", uri.replace(/:([^@]+)@/, ":****@"));
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected successfully");
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    await client.close();
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

test();
