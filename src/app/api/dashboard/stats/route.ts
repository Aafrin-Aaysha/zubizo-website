import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Design from '@/models/Design';
import Category from '@/models/Category';
import Inquiry from '@/models/Inquiry';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        await dbConnect();

        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

        // Core filter for all stats
        const adminDoc = await Admin.findById(admin.id);
        let query: any = {};
        if (!adminDoc || !adminDoc.showGlobalData) {
            query.assignedAdmin = admin.id;
        }

        const [totalDesigns, totalCategories, overdueDesign, upcomingDeadlines, allInquiries] = await Promise.all([
            Design.countDocuments({ isDeleted: false }), // Designs are global
            Category.countDocuments({ isActive: true }), // Categories are global
            Inquiry.countDocuments({ 
                ...query,
                status: 'Designing', 
                'timeline.designStartedAt': { $lt: fortyEightHoursAgo } 
            }),
            Inquiry.countDocuments({ 
                ...query,
                status: { $nin: ['Delivered', 'Completed'] },
                deliveryDeadline: { $lte: twoDaysFromNow, $gt: now } 
            }),
            Inquiry.find(query)
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('designId')
                .populate('assignedTo', 'name'),
        ]);

        return NextResponse.json({
            stats: [
                { label: 'Total Catalog', value: totalDesigns, trend: 'Premium', color: '#ae7fcb' },
                { label: 'Active Pipeline', value: allInquiries.length, trend: 'Live', color: '#10b981' },
                { label: 'Design Overdue', value: overdueDesign, trend: '>48h Limit', color: '#ef4444' },
                { label: 'Upcoming Delivery', value: upcomingDeadlines, trend: '<2d Alert', color: '#f59e0b' },
            ],
            recentInquiries: allInquiries,
        }, { status: 200 });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ message: 'Error fetching stats' }, { status: 500 });
    }
}
