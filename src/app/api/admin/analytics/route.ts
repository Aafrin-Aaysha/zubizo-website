import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import { getServerSession } from 'next-auth'; // Assuming authentication exists
import Admin from '@/models/Admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const adminId = searchParams.get('adminId');
        const sku = searchParams.get('sku');

        await dbConnect();

        // 1. Base Match Query for Orders (Financials)
        const orderStatusFilter = ['Confirmed', 'Designing', 'Design Confirmed', 'Printing', 'Delivered', 'Completed', 'CONFIRMED'];
        
        let matchQuery: any = {
            status: { $in: orderStatusFilter },
            'timeline.confirmedAt': { $exists: true }
        };

        if (startDate && endDate) {
            matchQuery['timeline.confirmedAt'] = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else {
            // Default 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            matchQuery['timeline.confirmedAt'] = { $gte: thirtyDaysAgo };
        }

        if (adminId && adminId !== 'All') {
            matchQuery.assignedAdmin = adminId;
        }

        if (sku && sku !== '') {
            matchQuery.sku = { $regex: sku, $options: 'i' };
        }

        // 2. Perform Aggregation
        const analytics = await Inquiry.aggregate([
            { $match: matchQuery },
            {
                $addFields: {
                    // Revenue = card_price * quantity (estimatedTotal) + charging + shipping
                    calcRevenue: {
                        $add: [
                            { $ifNull: ['$estimatedTotal', 0] },
                            { $ifNull: ['$billing.designingCharge', 0] },
                            { $ifNull: ['$billing.shippingCharge', 0] }
                        ]
                    },
                    // Expense = totalCost (materials + printing)
                    calcExpense: { $ifNull: ['$costing.totalCost', 0] }
                }
            },
            {
                $addFields: {
                    calcProfit: { $subtract: ['$calcRevenue', '$calcExpense'] }
                }
            },
            {
                $facet: {
                    // A. Summary Totals
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: '$calcRevenue' },
                                totalProfit: { $sum: '$calcProfit' },
                                totalOrders: { $sum: 1 },
                                completedOrders: {
                                    $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                                },
                                avgProfitPerOrder: { $avg: '$calcProfit' }
                            }
                        }
                    ],

                    // B. Time Series (Last 30 Days trend)
                    timeSeries: [
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$timeline.confirmedAt" } },
                                revenue: { $sum: '$calcRevenue' },
                                profit: { $sum: '$calcProfit' },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { "_id": 1 } }
                    ],

                    // C. Top Designs
                    topDesigns: [
                        {
                            $group: {
                                _id: "$designName",
                                sku: { $first: "$sku" },
                                revenue: { $sum: '$calcRevenue' },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { revenue: -1 } },
                        { $limit: 10 }
                    ],

                    // D. Material Analytics
                    materials: [
                        { $unwind: "$costing.materials" },
                        {
                            $group: {
                                _id: "$costing.materials.name",
                                usageCount: { $sum: 1 },
                                totalCost: { $sum: "$costing.materials.totalCost" }
                            }
                        },
                        { $sort: { totalCost: -1 } }
                    ],

                    // E. Customer Segmentation
                    customers: [
                        {
                            $group: {
                                _id: "$phone",
                                orderCount: { $sum: 1 },
                                isInternational: { 
                                    $first: { 
                                        $cond: [
                                            { $and: [ { $gt: [{ $strLenCP: { $ifNull: ["$phone", ""] } }, 5] }, { $not: { $regexMatch: { input: { $ifNull: ["$phone", ""] }, regex: "^(\\+91|91|0)" } } }] },
                                            true,
                                            false
                                        ]
                                    } 
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalCustomers: { $sum: 1 },
                                repeatCustomers: {
                                    $sum: { $cond: [{ $gt: ["$orderCount", 1] }, 1, 0] }
                                },
                                internationalOrders: {
                                    $sum: { $cond: ["$isInternational", 1, 0] }
                                }
                            }
                        }
                    ],

                    // F. Operational Performance (Confirmed -> Delivered)
                    operations: [
                        {
                            $match: {
                                'timeline.confirmedAt': { $exists: true },
                                'timeline.deliveredAt': { $exists: true }
                            }
                        },
                        {
                            $addFields: {
                                completionTimeMs: { $subtract: ["$timeline.deliveredAt", "$timeline.confirmedAt"] },
                                isDelayed: {
                                    $cond: [
                                        { $and: [{ $gt: ["$deliveryDeadline", null] }, { $gt: ["$timeline.deliveredAt", "$deliveryDeadline"] }] },
                                        1,
                                        0
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                avgCompletionMs: { $avg: "$completionTimeMs" },
                                delayCount: { $sum: "$isDelayed" },
                                totalDelivered: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        // 3. Conversion Funnel (Status independent of order filter)
        const funnel = await Inquiry.aggregate([
            {
                $group: {
                    _id: null,
                    leads: { $sum: 1 }, // All inquiries
                    contacted: {
                        $sum: { $cond: [{ $in: ["$status", ["Contacted", "CONTACTED", "FOLLOW_UP", "Confirmed", "Designing", "Printing", "Delivered", "Completed"]] }, 1, 0] }
                    },
                    confirmed: {
                        $sum: { $cond: [{ $in: ["$status", ["Confirmed", "CONFIRMED", "Designing", "Printing", "Delivered", "Completed"]] }, 1, 0] }
                    },
                    completed: {
                        $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = {
            summary: analytics[0].summary[0] || {},
            timeSeries: analytics[0].timeSeries || [],
            topDesigns: analytics[0].topDesigns || [],
            materials: analytics[0].materials || [],
            customers: analytics[0].customers[0] || {},
            operations: analytics[0].operations[0] || {},
            funnel: funnel[0] || {}
        };

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Analytics Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
