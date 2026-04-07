import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import Design from '@/models/Design';
import Category from '@/models/Category';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://zubizoart.com'; // Updated to actual production domain

    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
        { url: `${baseUrl}/catalog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
        { url: `${baseUrl}/policies`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    ];

    try {
        await dbConnect();

        // 1. Fetch Designs
        const designs = await Design.find({ isDeleted: false, isActive: true }).select('slug updatedAt');
        const designUrls = designs.map((d) => ({
            url: `${baseUrl}/catalog/${d.slug}`,
            lastModified: d.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        // 2. Fetch Categories
        const categories = await Category.find({ isDeleted: false, isActive: true }).select('slug updatedAt name');
        const categoryUrls = categories.map((c) => ({
            url: `${baseUrl}/catalog?category=${c.name}`,
            lastModified: c.updatedAt || new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }));

        return [...staticPages, ...designUrls, ...categoryUrls];
    } catch (error) {
        console.error("Failed to generate complete sitemap:", error);
        return staticPages;
    }
}
