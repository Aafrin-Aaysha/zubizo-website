import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import MaterialCategory from '@/models/MaterialCategory';
import Material from '@/models/Material';

// Ensure DB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zubizo';
if (mongoose.connection.readyState === 0) {
    mongoose.connect(MONGODB_URI);
}

export async function PUT(request: Request, context: { params: any }) {
    try {
        const params = await context.params;
        const body = await request.json();
        const { name } = body;
        
        if (!name) {
            return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        }
        
        const category = await MaterialCategory.findById(params.id);
        if (!category) {
            return NextResponse.json({ message: 'Category not found' }, { status: 404 });
        }
        
        const oldName = category.name;
        
        // Update category name
        category.name = name;
        await category.save();
        
        // Update all materials that had the old category name
        await Material.updateMany(
            { category: oldName },
            { $set: { category: name } }
        );
        
        return NextResponse.json(category);
    } catch (error: any) {
        console.error("PUT /api/admin/categories/[id] error:", error);
        if (error.code === 11000) {
            return NextResponse.json({ message: 'Category name already exists' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error updating category' }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: any }) {
    try {
        const params = await context.params;
        const category = await MaterialCategory.findById(params.id);
        if (!category) {
            return NextResponse.json({ message: 'Category not found' }, { status: 404 });
        }
        
        // Check if there are any materials using this category
        const materialCount = await Material.countDocuments({ category: category.name });
        
        if (materialCount > 0) {
            return NextResponse.json({ 
                message: `Cannot delete category. There are ${materialCount} materials using this category. Please reassign or delete them first.` 
            }, { status: 400 });
        }
        
        await MaterialCategory.findByIdAndDelete(params.id);
        
        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error("DELETE /api/admin/categories/[id] error:", error);
        return NextResponse.json({ message: 'Error deleting category' }, { status: 500 });
    }
}
