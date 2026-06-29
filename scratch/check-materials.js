require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const materials = await db.collection('materials').find({ isActive: { $ne: false } }).toArray();
        let output = '--- MATERIALS ---\n';
        materials.forEach(m => {
            output += `- Name: "${m.name}" (Category: "${m.category}")\n`;
        });
        output += '-----------------\n';
        fs.writeFileSync('scratch/materials-list.txt', output, 'utf8');
        console.log("Successfully wrote materials to scratch/materials-list.txt");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
