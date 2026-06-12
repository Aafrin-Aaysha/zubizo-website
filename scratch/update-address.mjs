import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGODB_URI not found in environment.");
        return;
    }
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        
        // List all collections to find site settings collection
        const collections = await db.listCollections().toArray();
        console.log('Collections in database:', collections.map(c => c.name));
        
        const settingsCollectionName = collections.find(c => c.name.toLowerCase().includes('setting'))?.name || 'sitesettings';
        console.log(`Using collection: ${settingsCollectionName}`);
        
        const settingsCollection = db.collection(settingsCollectionName);
        const settingsDoc = await settingsCollection.findOne();
        
        const newAddress = `SS Arcade, 3F, 3rd Floor, Convent Road,\nCantonment, Trichy 620001`;
        
        if (settingsDoc) {
            const result = await settingsCollection.updateOne(
                { _id: settingsDoc._id },
                { $set: { address: newAddress } }
            );
            console.log('Update result:', result);
        } else {
            const result = await settingsCollection.insertOne({
                address: newAddress,
                about: 'Premium Invitation Stationary Brand.',
                terms: 'Terms of service apply.',
                phone: '+91 0000000000',
                email: 'contact@zubizo.com',
                whatsappNumber: '8124548133',
                heroSlides: [],
                defaultMaterials: []
            });
            console.log('Insert result:', result);
        }
        
        const updatedDoc = await settingsCollection.findOne();
        console.log('Updated settings document address:', updatedDoc?.address);
    } catch (e) {
        console.error('Error run:', e);
    } finally {
        await client.close();
    }
}
run();
