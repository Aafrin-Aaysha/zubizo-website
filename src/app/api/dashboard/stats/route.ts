import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Design from '@/models/Design';
import Invoice from '@/models/Invoice';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Core filter for invoices
        let query: any = {};
        if (admin.role !== 'super-admin') {
            query.adminId = admin.id;
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const [totalDesigns, allInvoices] = await Promise.all([
            Design.countDocuments({ isDeleted: false }),
            Invoice.find(query).sort({ createdAt: -1 }).lean()
        ]);

        let totalRevenue = 0;
        let totalProfit = 0;
        let totalMaterialsUsed = 0; // Just counting quantity of units deducted

        for (const inv of allInvoices) {
            totalRevenue += inv.grandTotal || 0;
            totalProfit += inv.profit || 0;
            if (inv.materialsUsed && Array.isArray(inv.materialsUsed)) {
                for (const mat of inv.materialsUsed) {
                    totalMaterialsUsed += mat.quantityUsed || 0;
                }
            }
        }

        return NextResponse.json({
            stats: [
                { label: 'Total Orders', value: allInvoices.length, trend: 'Generated', color: '#ae7fcb' },
                { label: 'Total Revenue', value: '₹' + totalRevenue.toFixed(0), trend: 'Processed', color: '#10b981' },
                { label: 'Net Profit', value: '₹' + totalProfit.toFixed(0), trend: 'Margin', color: '#059669' },
                { label: 'Materials Used', value: totalMaterialsUsed, trend: 'Units', color: '#f59e0b' },
            ],
            recentInvoices: allInvoices.slice(0, 10), // only return top 10 for recent
        }, { status: 200 });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ message: 'Error fetching stats' }, { status: 500 });
    }
}
