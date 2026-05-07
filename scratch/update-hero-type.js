
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function update() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const result = await db.collection('homepagesections').updateOne(
            { sectionType: 'hero' },
            { 
                $set: { 
                    sectionType: 'cinematicHero',
                    content: {
                        tagline: "Bespoke Invitation Atelier",
                        titleLine1: "A Timeless",
                        titleHighlight: "Beginning",
                        titleLine2: "For",
                        titleLine3: "Your Love",
                        description: "Bespoke designs that capture the essence of your most beautiful moments, crafted with artisanal precision and luxury materials.",
                        backgroundImage: "/zubizo_invites/25.jpeg"
                    }
                } 
            }
        );
        console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

update();
