const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { join } = require('path');

dotenv.config({ path: join(__dirname, '../.env.local') });

const HomePageSectionSchema = new mongoose.Schema({}, { strict: false });
const HomePageSection = mongoose.models.HomePageSection || mongoose.model('HomePageSection', HomePageSectionSchema);

async function run() {
    console.log("Connecting to", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);

    await HomePageSection.deleteMany({});
    console.log("Cleared old sections. They will be re-bootstrapped from bootstrap-homepage.ts on next page load.");

    process.exit(0);
}

run();
