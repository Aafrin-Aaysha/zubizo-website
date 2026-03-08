import * as React from "react";
import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Design from "@/models/Design";
import Category from "@/models/Category";
import CatalogUI from "@/components/catalog/CatalogUI";
import { Metadata } from "next";
import { getStartingPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Our Catalogue | Zubizo",
    description: "Explore our collection of premium, handcrafted invitation designs.",
};

export default async function CatalogPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const search = (params.search as string) || "";
    const category = (params.category as string) || "All";
    const sort = (params.sort as string) || "featured";
    const priceRange = (params.priceRange as string) || "";
    const price = (params.price as string) || "";
    const maxPrice = (params.maxPrice as string) || "";
    const minPrice = (params.minPrice as string) || "";

    await dbConnect();

    // 1. Fetch Categories
    const categories = await Category.find({ isDeleted: false, isActive: true }).sort({ displayOrder: 1, name: 1 }).lean();

    // 2. Build Query
    const query: any = {
        isDeleted: false,
        isActive: true,
    };

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { sku: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    if (category !== "All") {
        const catDoc = await Category.findOne({ name: category, isDeleted: false }).lean();
        if (catDoc) {
            query.categoryId = catDoc._id;
        }
    }

    // Handle price filters from ShopByPrice section
    if (price || maxPrice || minPrice) {
        const p = price ? parseInt(price) : null;
        const max = maxPrice ? parseInt(maxPrice) : (p === 120 ? Infinity : p);
        const min = minPrice ? parseInt(minPrice) : (p === 120 ? 120 : 0);

        if (max !== null || min !== 0) {
            query['packages.pricePerCard'] = {};
            if (max && max !== Infinity) query['packages.pricePerCard'].$lte = max;
            if (min) query['packages.pricePerCard'].$gte = min;
        }
    }

    // Legacy Price range filtering (optional to keep for compatibility)
    if (priceRange && !price) {
        switch (priceRange) {
            case 'under30':
                query['packages.pricePerCard'] = { $lte: 30 };
                break;
            case 'under60':
                query['packages.pricePerCard'] = { $lte: 60 };
                break;
            case 'under90':
                query['packages.pricePerCard'] = { $lte: 90 };
                break;
            case 'premium':
                query['packages.pricePerCard'] = { $gte: 120 };
                break;
        }
    }

    // 3. Fetch Designs
    let designsQuery = Design.find(query).populate('categoryId');

    // 4. Handle sorting
    switch (sort) {
        case 'price_asc':
            // Note: Since price is nested in packages, we usually sort in-memory or 
            // use a more complex aggregation. For simplicity and catalog size, 
            // in-memory sort or sorting by basePrice if available.
            // As per schema, it's packages.pricePerCard.
            break;
        case 'price_desc':
            break;
        case 'newest':
            designsQuery = designsQuery.sort({ createdAt: -1 });
            break;
        default:
            designsQuery = designsQuery.sort({ isTrending: -1, createdAt: -1 });
            break;
    }

    let designs = await designsQuery.lean();

    // In-memory price sorting if needed because nested Price is hard to sort via simple find()
    if (sort === 'price_asc' || sort === 'price_desc') {
        designs = (designs as any[]).sort((a, b) => {
            const priceA = getStartingPrice(a);
            const priceB = getStartingPrice(b);
            return sort === 'price_asc' ? priceA - priceB : priceB - priceA;
        });
    }

    // Serialize
    const serializedDesigns = JSON.parse(JSON.stringify(designs));
    const serializedCategories = JSON.parse(JSON.stringify(categories));

    return (
        <main className="min-h-screen bg-white">
            <LuxuryNavbar />

            {/* Page Header */}
            <section className="pt-28 pb-0 bg-white border-b border-neutral-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 pt-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-lavender">
                        <Link href="/" className="hover:opacity-60 transition-opacity">Home</Link>
                        <span className="text-neutral-300">›</span>
                        <span className="text-neutral-400">Catalogue</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pt-4 pb-8">
                        <div>
                            <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight font-serif">
                                Our Catalogue
                            </h1>
                            <p className="text-neutral-400 mt-2 text-sm font-medium">
                                {serializedDesigns.length} exquisite designs found
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Catalog UI (Interactive Client Component) */}
            <CatalogUI
                initialDesigns={serializedDesigns}
                categories={serializedCategories}
            />

            <LuxuryFooter />
        </main>
    );
}
