import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Design from '@/models/Design';
import Category from '@/models/Category';
import Inquiry from '@/models/Inquiry';

export async function GET() {
    try {
        await dbConnect();

        const [totalDesigns, totalCategories, recentInquiriesCount, allInquiries] = await Promise.all([
            Design.countDocuments({ isDeleted: false }),
            Category.countDocuments({ isActive: true }),
            Inquiry.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
            Inquiry.find().sort({ createdAt: -1 }).limit(8).populate('designId'),
        ]);

        // Calculate a more realistic conversion or growth metric
        const activeDesigns = await Design.countDocuments({ isDeleted: false, isActive: true });

        return NextResponse.json({
            stats: [
                { label: 'Total Catalog', value: totalDesigns, trend: `+${activeDesigns} Live`, color: '#ae7fcb' },
                { label: 'Collections', value: totalCategories, trend: 'Organized', color: '#10b981' },
                { label: 'Weekly Inquiries', value: recentInquiriesCount, trend: 'Active', color: '#f59e0b' },
                { label: 'Platform Status', value: 'Healthy', trend: 'Secure', color: '#3b82f6' },
            ],
            recentInquiries: allInquiries,
        }, { status: 200 });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ message: 'Error fetching stats' }, { status: 500 });
    }
}
