import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Design from '@/models/Design';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        await dbConnect();

        const designs = await Design.find({ isDeleted: false });
        const results = [];

        for (const design of designs) {
            const oldSlug = design.slug;

            // Forces the slug pre-save hook to re-run based on Name and SKU
            // By clearing the slug and marking it as modified
            design.slug = undefined;

            // Manual fallback if the hook doesn't trigger for some reason
            if (!design.slug && design.name && design.sku) {
                let base = `${design.name}-${design.sku}`
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");

                design.slug = base;
            }

            await design.save();

            results.push({
                name: design.name,
                oldSlug,
                newSlug: design.slug
            });
        }

        return NextResponse.json({
            message: `Successfully updated ${results.length} designs`,
            updates: results
        });
    } catch (error: any) {
        console.error("Fix slugs error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
