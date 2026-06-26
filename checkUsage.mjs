import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkUsage() {
    console.log("=== USAGE REPORT ===");
    try {
        // 1. Check MongoDB
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            const db = mongoose.connection.db;
            const stats = await db.stats();
            
            console.log("\n--- MongoDB Atlas ---");
            console.log(`Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`Collections: ${stats.collections}`);
            console.log(`Total Documents: ${stats.objects}`);
            
            // Note: MongoDB Free Tier (M0) provides 512 MB of storage space.
            const totalAllowedMB = 512;
            const usedMB = (stats.storageSize / 1024 / 1024);
            console.log(`Estimated Storage Used: ${((usedMB / totalAllowedMB) * 100).toFixed(2)}% of 512MB (Free Tier)`);
            
            await mongoose.disconnect();
        } else {
            console.log("\n--- MongoDB Atlas ---");
            console.log("MONGODB_URI not found in .env.local");
        }

        // 2. Check Cloudinary
        if (process.env.CLOUDINARY_URL || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
            if (!process.env.CLOUDINARY_URL) {
                cloudinary.config({
                    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET
                });
            }
            
            console.log("\n--- Cloudinary ---");
            const usage = await cloudinary.api.usage();
            
            // The usage API returns credits and bandwidth
            const storageUsage = usage.storage ? usage.storage.usage : 0;
            const storageLimit = usage.storage ? usage.storage.limit : 1;
            console.log(`Storage Used: ${(storageUsage / 1024 / 1024 / 1024).toFixed(3)} GB / ${(storageLimit / 1024 / 1024 / 1024).toFixed(1)} GB allowed`);
            
            const bandwidthUsage = usage.bandwidth ? usage.bandwidth.usage : 0;
            const bandwidthLimit = usage.bandwidth ? usage.bandwidth.limit : 1;
            console.log(`Bandwidth Used (This Month): ${(bandwidthUsage / 1024 / 1024 / 1024).toFixed(3)} GB / ${(bandwidthLimit / 1024 / 1024 / 1024).toFixed(1)} GB allowed`);
            
            console.log(`Monthly Credits Used: ${usage.credits ? usage.credits.usage : 0} / ${usage.credits ? usage.credits.limit : 25}`);

        } else {
            console.log("\n--- Cloudinary ---");
            console.log("Cloudinary credentials not found.");
        }
        
    } catch (e) {
        console.error("Error checking usage:", e.message);
        process.exit(1);
    }
}

checkUsage();
