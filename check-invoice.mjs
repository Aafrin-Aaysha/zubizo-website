import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  const uri = process.env.MONGODB_URI;
  const idStr = '69ddfd6545bcf5bc6f11107c';
  
  if (!uri) {
    console.error("MONGODB_URI not found");
    return;
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    const invoice = await db.collection('invoices').findOne({ _id: new ObjectId(idStr) });
    
    if (invoice) {
        console.log("Invoice Found:", JSON.stringify(invoice, null, 2));
    } else {
        console.log("Invoice NOT Found in DB");
    }
    await client.close();
  } catch (err) {
    console.error("Error:", err);
  }
}

check();
