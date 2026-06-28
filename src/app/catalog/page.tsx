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
    const sort = (params.sort as string) || "newest";
    const priceRange = (params.priceRange as string) || "";
    const price = (params.price as string) || "";
    const maxPrice = (params.maxPrice as string) || "";
    const minPrice = (params.minPrice as string) || "";

    await dbConnect();

    // 1. Fetch Categories
    const categories = await Category.find({
        isDeleted: false,
        isActive: true,
        name: { $nin: ["Digital E-Invite", "Premium E-Website"] }
    }).sort({ displayOrder: 1, name: 1 }).lean();

    // 2. Build Query
    const query: any = {
        isDeleted: false,
        isActive: true,
        categoryId: { $in: categories.map(c => c._id) }
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

    // 3. Initialize Designs Query
    let designsQuery;

    // 4. Handle sorting & specific status filters
    switch (sort) {
        case 'price_asc':
        case 'price_desc':
            designsQuery = Design.find(query).populate('categoryId');
            break;
        case 'newest':
            designsQuery = Design.find(query).populate('categoryId').sort({ sku: -1 });
            break;
        case 'new_arrivals':
            query.isNewArrival = true;
            designsQuery = Design.find(query).populate('categoryId').sort({ sku: -1 });
            break;
        case 'id_asc':
            designsQuery = Design.find(query).populate('categoryId').sort({ sku: 1 });
            break;
        case 'id_desc':
            designsQuery = Design.find(query).populate('categoryId').sort({ sku: -1 });
            break;
        case 'best_seller':
            query.isTrending = true;
            designsQuery = Design.find(query).populate('categoryId').sort({ sku: -1 });
            break;
        case 'trending':
            query.isFeatured = true;
            designsQuery = Design.find(query).populate('categoryId').sort({ sku: -1 });
            break;
        default:
            designsQuery = Design.find(query).populate('categoryId').sort({ sku: -1 }); // Fallback to newest
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
        <main className="min-h-screen bg-[#FAF8F5] font-dmsans">
            <LuxuryNavbar />

            {/* Premium Hero Banner */}
            <section className="pt-24 pb-4 bg-transparent">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div 
                        className="relative overflow-hidden rounded-[20px] md:rounded-[24px] bg-slate-900 flex items-center justify-center text-center shadow-lg h-[220px] sm:h-[320px] lg:h-[420px]"
                    >
                        {/* Background Image */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
                            style={{
                                backgroundImage: "url('/img3.jpg')",
                            }}
                        />
                        {/* Subtle Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/25" />

                        {/* Content */}
                        <div className="relative z-10 px-6 max-w-2xl">
                            {/* Breadcrumb */}
                            <nav className="flex items-center justify-center gap-1.5 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">
                                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                                <span className="opacity-50">•</span>
                                <span className="text-white">Catalogue</span>
                            </nav>

                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal text-white tracking-tight font-italiana mb-3">
                                Our Catalogue
                            </h1>
                            <p className="text-white/80 text-xs md:text-sm font-light tracking-wide">
                                Explore our handcrafted invitation collections.
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
