import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Design from '@/models/Design';
import Category from '@/models/Category';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

// Explicitly register models to avoid MissingSchemaError
const _Design = Design;
const _Category = Category;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId');
        const search = searchParams.get('search');
        const isTrending = searchParams.get('isTrending');
        const limit = searchParams.get('limit');
        const maxPrice = searchParams.get('maxPrice');
        const minPrice = searchParams.get('minPrice');
        const ids = searchParams.get('ids');

        await dbConnect();

        let query: any = { isDeleted: false };
        if (ids) {
            query._id = { $in: ids.split(',').filter(id => id.length === 24) };
        }
        if (categoryId) query.categoryId = categoryId;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }

        if (isTrending === 'true') query.isTrending = true;
        const isFeatured = searchParams.get('isFeatured');
        if (isFeatured === 'true') query.isFeatured = true;

        // For public catalog, only show active designs
        const showInactive = searchParams.get('showInactive');
        if (showInactive !== 'true') {
            query.isActive = true;
        }

        let queryBuilder = Design.find(query)
            .populate('categoryId')
            .sort({ createdAt: -1 });

        if (limit) {
            queryBuilder = queryBuilder.limit(parseInt(limit));
        }

        let designs = await queryBuilder;

        // Filter by price ranges (based on cheapest package pricePerCard across all tiers)
        if (maxPrice || minPrice) {
            const max = maxPrice ? parseFloat(maxPrice) : Infinity;
            const min = minPrice ? parseFloat(minPrice) : 0;
            designs = designs.filter((d: any) => {
                let cheapest = Infinity;
                if (!d.packages || d.packages.length === 0) {
                    cheapest = d.basePrice || 0;
                } else {
                    d.packages.forEach((pkg: any) => {
                        if (pkg.priceTiers && pkg.priceTiers.length > 0) {
                            pkg.priceTiers.forEach((tier: any) => {
                                if (tier.pricePerCard < cheapest) cheapest = tier.pricePerCard;
                            });
                        } else if (pkg.pricePerCard > 0 && pkg.pricePerCard < cheapest) {
                            cheapest = pkg.pricePerCard;
                        }
                    });
                }
                if (cheapest === Infinity) cheapest = d.basePrice || 0;
                return cheapest >= min && cheapest <= max;
            });
        }

        return NextResponse.json(designs);
    } catch (error) {
        console.error("GET /api/designs error:", error);
        return NextResponse.json({ message: 'Error fetching designs' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        const body = await req.json();

        // Ensure slug is generated if not provided
        if (!body.slug && body.name && body.sku) {
            body.slug = `${body.name}-${body.sku}`
                .toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-');
        }

        await dbConnect();
        const newDesign = await Design.create(body);
        return NextResponse.json(newDesign, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/designs error:", error);
        if (error.code === 11000) {
            return NextResponse.json({
                message: error.keyPattern?.sku ? 'SKU already exists' : 'Slug already exists'
            }, { status: 400 });
        }
        return NextResponse.json({ message: error.message || 'Error creating design' }, { status: 500 });
    }
}
