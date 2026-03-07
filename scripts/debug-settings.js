import dbConnect from './src/lib/db';
import SiteSettings from './src/models/SiteSettings';

async function checkSettings() {
    try {
        await dbConnect();
        const settings = await SiteSettings.findOne();
        console.log('Current Site Settings in DB:');
        console.log(JSON.stringify(settings, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error checking settings:', error);
        process.exit(1);
    }
}

checkSettings();
