import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Design from '@/models/Design';
import Category from '@/models/Category';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Core query for designs
        let query: any = { isDeleted: false };
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Fetch digital categories
        const digitalCategories = await Category.find({
            name: { $in: ["Digital E-Invite", "Premium E-Website"] }
        }).select('_id');
        const digitalCatIds = digitalCategories.map(c => c._id);

        const [
            physicalDesigns,
            digitalDesigns,
            bestSellers,
            trendingDesigns,
            newArrivals,
            recentDesigns,
        ] = await Promise.all([
            Design.countDocuments({ ...query, categoryId: { $nin: digitalCatIds } }),
            Design.countDocuments({ ...query, categoryId: { $in: digitalCatIds } }),
            Design.countDocuments({ ...query, isTrending: true }),
            Design.countDocuments({ ...query, isFeatured: true }),
            Design.countDocuments({ ...query, isNewArrival: true }),
            Design.find(query).sort({ createdAt: -1 }).limit(8).populate('categoryId', 'name').lean()
        ]);

        return NextResponse.json({
            stats: [
                { label: 'Physical Designs', value: physicalDesigns, trend: 'Cards', color: '#ae7fcb' },
                { label: 'Digital Designs', value: digitalDesigns, trend: 'E-Invites', color: '#8b5cf6' },
                { label: 'Best Sellers', value: bestSellers, trend: 'Top Rated', color: '#10b981' },
                { label: 'Trending Designs', value: trendingDesigns, trend: 'Popular', color: '#f59e0b' },
                { label: 'New Arrivals', value: newArrivals, trend: 'Recent', color: '#3b82f6' },
            ],
            recentDesigns: recentDesigns,
        }, { status: 200 });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ message: 'Error fetching stats' }, { status: 500 });
    }
}
