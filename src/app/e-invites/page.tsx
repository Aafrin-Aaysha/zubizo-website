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
    title: "Digital E-Invites | Zubizo",
    description: "Premium digital invitation designs delivered instantly as crisp, elegant PDFs.",
};

export default async function EInvitesPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const search = (params.search as string) || "";

    await dbConnect();

    // 1. Find "E-Invites" category
    let eInviteCategory = await Category.findOne({ name: "E-Invites", isDeleted: false });
    
    let designs: any[] = [];
    let serializedCategories: any[] = [];

    if (eInviteCategory) {
        // 2. Fetch Designs specifically for E-Invites
        const query: any = {
            categoryId: eInviteCategory._id,
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

        designs = await Design.find(query).sort({ isTrending: -1, createdAt: -1 }).populate('categoryId').lean();
        serializedCategories = JSON.parse(JSON.stringify([eInviteCategory]));
    }

    // Serialize
    const serializedDesigns = JSON.parse(JSON.stringify(designs));

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
                        <span className="text-neutral-400">E-Invites</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pt-4 pb-8">
                        <div>
                            <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight font-serif">
                                Digital E-Invites
                            </h1>
                            <p className="text-neutral-400 mt-2 text-sm font-medium max-w-lg">
                                Delivered instantly as high-resolution PDFs. Perfect for modern, eco-friendly celebrations. 
                            </p>
                        </div>
                        <div className="text-left md:text-right">
                             <p className="text-sm font-bold text-lavender bg-lavender/5 px-4 py-2 rounded-full inline-block">
                                {serializedDesigns.length} {serializedDesigns.length === 1 ? 'Design' : 'Designs'} Available
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
