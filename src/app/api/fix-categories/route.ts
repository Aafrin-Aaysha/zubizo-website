import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Design from '@/models/Design';

export async function GET() {
    await dbConnect();
    
    // Log all categories
    const allCategories = await Category.find({});
    
    // Find the closest match
    let cat = allCategories.find(c => c.name.toLowerCase().includes('south indian'));
    
    // Fallback if exactly 'south indian' not found
    if (!cat) {
        cat = allCategories.find(c => c.name.toLowerCase().includes('traditional'));
    }

    if (!cat) {
        return NextResponse.json({ error: 'No traditional category found', all: allCategories.map(c => c.name) });
    }

    // Update the two designs
    const result = await Design.updateMany(
        { sku: { $in: ['ZB-1001', 'ZB_1002'] } },
        { $set: { categoryId: cat._id } }
    );

    return NextResponse.json({
        success: true,
        assignedTo: cat.name,
        modifiedCount: result.modifiedCount,
        allCategories: allCategories.map(c => c.name)
    });
}
