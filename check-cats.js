
import dbConnect from './src/lib/db';
import Category from './src/models/Category';

async function check() {
    await dbConnect();
    const count = await Category.countDocuments();
    const cats = await Category.find();
    console.log(`Found ${count} categories.`);
    console.log(JSON.stringify(cats, null, 2));
    process.exit(0);
}

check();
