const mongoose = require('mongoose');

async function updateSettings() {
    try {
        const MONGODB_URI = "mongodb+srv://zubizo_admin:Afrose20041979@zubizo-prod.gf3ux7t.mongodb.net/?appName=zubizo-prod";
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        
        // Find the SiteSettings collection. Mongoose models 'SiteSettings' to 'sitesettings'
        const collections = await db.listCollections().toArray();
        const settingsCollection = collections.find(c => c.name.toLowerCase().includes('settings'));
        
        if (!settingsCollection) {
            console.error('Could not find settings collection');
            process.exit(1);
        }

        const collectionName = settingsCollection.name;
        console.log('Updating collection:', collectionName);

        const result = await db.collection(collectionName).updateOne(
            {},
            { 
                $set: { 
                    phone: "+91 81245 48133",
                    whatsappNumber: "8124548133" 
                } 
            }
        );

        console.log('Update result:', result);
        process.exit(0);
    } catch (error) {
        console.error('Error updating settings:', error);
        process.exit(1);
    }
}

updateSettings();
