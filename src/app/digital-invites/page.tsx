import * as React from "react";
import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Design from "@/models/Design";
import Category from "@/models/Category";
import CatalogUI from "@/components/catalog/CatalogUI";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Digital Invites | Premium E-Invites & Websites | Zubizo",
    description: "Premium digital invitation designs for the modern couple. Choose from high-resolution E-Invites or interactive, mobile-friendly E-Websites.",
};

export default async function DigitalInvitesPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const search = (params.search as string) || "";
    const activeSubCat = (params.category as string) || "all";

    await dbConnect();

    // 1. Find relevant categories
    const categories = await Category.find({
        name: { $in: ["Digital E-Invite", "Premium E-Website"] },
        isDeleted: false
    }).sort({ displayOrder: 1 });
    
    const categoryIds = categories.map(c => c._id);

    // 2. Fetch Designs for these categories
    const query: any = {
        categoryId: { $in: categoryIds },
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

    if (activeSubCat !== "all") {
        query.categoryId = activeSubCat;
    }

    const designs = await Design.find(query)
        .sort({ isTrending: -1, createdAt: -1 })
        .populate('categoryId')
        .lean();

    // Serialize
    const serializedDesigns = JSON.parse(JSON.stringify(designs));
    const serializedCategories = JSON.parse(JSON.stringify(categories));

    return (
        <main className="min-h-screen bg-[#fafafb]">
            <LuxuryNavbar />

            {/* Page Header */}
            <section className="pt-32 pb-16 bg-white border-b border-neutral-100">
                <div className="site-container">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-lavender/60">
                        <Link href="/" className="hover:text-lavender transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-charcoal">Digital Invites</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-6xl font-black text-charcoal tracking-tight leading-[0.9] mb-4">
                                Digital <br />
                                <span className="text-lavender">Invitations.</span>
                            </h1>
                            <p className="text-gray-500 text-lg font-medium leading-relaxed">
                                Experience elegance in the digital realm. Choose between our high-resolution 
                                specialized E-Invites or interactive, mobile-optimized E-Websites for your celebration.
                            </p>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-lavender/5 border border-lavender/10 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-lavender animate-pulse" />
                                <span className="text-[10px] font-black text-lavender uppercase tracking-widest">
                                    {serializedDesigns.length} Artisanal Designs Available
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Delivery Note for E-Invites */}
            {activeSubCat !== "Premium E-Website" && (
                <div className="site-container mb-8">
                    <div className="bg-lavender/5 border border-lavender/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-lavender ring-1 ring-lavender/10">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-charcoal">Digital Delivery Guarantee</h3>
                                <p className="text-sm text-gray-500">All E-Invites are delivered as high-resolution PNG, JPEG, and PDF formats ready for sharing.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="px-3 py-1 bg-white rounded-lg border border-neutral-100 text-[10px] font-black text-charcoal uppercase tracking-widest">PNG</span>
                             <span className="px-3 py-1 bg-white rounded-lg border border-neutral-100 text-[10px] font-black text-charcoal uppercase tracking-widest">JPEG</span>
                             <span className="px-3 py-1 bg-white rounded-lg border border-neutral-100 text-[10px] font-black text-charcoal uppercase tracking-widest">PDF</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-Category Navigation & Catalog UI */}
            <div className="pb-24">
                <CatalogUI
                    initialDesigns={serializedDesigns}
                    categories={serializedCategories}
                />
            </div>

            <LuxuryFooter />
        </main>
    );
}
