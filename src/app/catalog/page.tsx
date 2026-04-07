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

    // 3. Fetch Designs (Querying DB for category and search only)
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

    // 5. In-memory Price Filtering (Filtering based on Starting Price shown in UI)
    if (price || maxPrice || minPrice || priceRange) {
        const p = price ? parseInt(price) : null;
        const max = maxPrice ? parseInt(maxPrice) : (p === 120 ? Infinity : p) ?? undefined;
        const min = minPrice ? parseInt(minPrice) : (p === 120 ? 120 : 0);

        // Map priceRange for legacy support
        let filterMax = max;
        let filterMin = min;

        if (priceRange && !price && !maxPrice && !minPrice) {
            if (priceRange === 'under30') filterMax = 30;
            else if (priceRange === 'under60') filterMax = 60;
            else if (priceRange === 'under90') filterMax = 90;
            else if (priceRange === 'premium') filterMin = 120;
        }

        designs = designs.filter((design: any) => {
            const startingPrice = getStartingPrice(design);
            const matchesMin = filterMin === undefined || filterMin === 0 || startingPrice >= filterMin;
            const matchesMax = filterMax === undefined || filterMax === Infinity || startingPrice <= filterMax;
            return matchesMin && matchesMax;
        });
    }

    // 6. In-memory price sorting if needed because nested Price is hard to sort via simple find()
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
                activePriceFilter={{
                    maxPrice: maxPrice || "",
                    minPrice: minPrice || "",
                    priceRange: priceRange || "",
                }}
            />

            <LuxuryFooter />
        </main>
    );
}
