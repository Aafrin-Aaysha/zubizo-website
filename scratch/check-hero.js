require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const sections = await mongoose.connection.db.collection('homepagesections')
        .find({ sectionType: { $in: ['centeredHero', 'cinematicHero', 'hero'] } })
        .toArray();
    sections.forEach(s => {
        console.log('Type:', s.sectionType, '| Visible:', s.isVisible);
        console.log('Content:', JSON.stringify(s.content, null, 2));
    });
    process.exit(0);
});
