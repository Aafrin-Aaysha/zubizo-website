require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(() =>
    mongoose.connection.db.collection('homepagesections').updateOne(
        { sectionType: 'testimonials' },
        { $set: { 'styling.backgroundColor': '#FAF8F5' } }
    ).then(r => { console.log('modified:', r.modifiedCount); process.exit(0); })
);
