const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function init() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zubizo');
    const Material = require('./src/models/Material').default;
    const cats = await Material.distinct('category');
    console.log(cats);
    process.exit();
}
init();
