import mongoose from 'mongoose';
import Category from '@/models/Category';
import Design from '@/models/Design';
import SiteSettings from '@/models/SiteSettings';
import Inquiry from '@/models/Inquiry';

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!MONGODB_URI) {
        console.warn('MONGODB_URI is not defined. Database connection will likely fail.');
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            // Register models immediately on connection
            const _c = Category;
            const _d = Design;
            const _s = SiteSettings;
            const _i = Inquiry;
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
