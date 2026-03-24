import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

export async function GET() {
    try {
        await dbConnect();
        
        let eInviteCategory = await Category.findOne({ name: "E-Invites", isDeleted: false });
        
        if (!eInviteCategory) {
            const maxCat = await Category.findOne().sort({ displayOrder: -1 });
            const nextOrder = maxCat ? (maxCat as any).displayOrder + 1 : 1;
            
            eInviteCategory = await Category.create({
                name: "E-Invites",
                slug: "e-invites",
                description: "Premium Digital PDF Invitations",
                displayOrder: nextOrder,
                isActive: true,
                isDeleted: false
            });
            
            return NextResponse.json({
                success: true,
                message: "Created E-Invites category successfully!",
                category: eInviteCategory
            });
        }
        
        return NextResponse.json({
            success: true,
            message: "E-Invites category already exists.",
            category: eInviteCategory
        });
        
    } catch (error: any) {
        console.error("Failed to setup E-Invites category:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
