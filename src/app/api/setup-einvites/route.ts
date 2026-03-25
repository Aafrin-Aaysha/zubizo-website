import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

export async function GET() {
    try {
        await dbConnect();
        
        let inviteCat = await Category.findOne({ name: "Digital E-Invite", isDeleted: false });
        let websiteCat = await Category.findOne({ name: "Premium E-Website", isDeleted: false });
        
        const maxCat = await Category.findOne().sort({ displayOrder: -1 });
        let nextOrder = maxCat ? (maxCat as any).displayOrder + 1 : 1;
        
        if (!inviteCat) {
            inviteCat = await Category.create({
                name: "Digital E-Invite",
                slug: "digital-e-invite",
                description: "High-resolution digital invitations in JPEG/PNG/PDF formats.",
                displayOrder: nextOrder++,
                isActive: true,
                isDeleted: false
            });
        }

        if (!websiteCat) {
            websiteCat = await Category.create({
                name: "Premium E-Website",
                slug: "premium-e-website",
                description: "Interactive, mobile-friendly digital invitation websites.",
                displayOrder: nextOrder++,
                isActive: true,
                isDeleted: false
            });
        }
        
        return NextResponse.json({
            success: true,
            message: "Digital Invite categories setup complete!",
            categories: { inviteCat, websiteCat }
        });
        
    } catch (error: any) {
        console.error("Failed to setup E-Invites category:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
