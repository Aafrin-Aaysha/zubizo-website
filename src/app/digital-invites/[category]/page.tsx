import * as React from "react";
import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Design from "@/models/Design";
import Category from "@/models/Category";
import { Metadata } from "next";
import InviteCard from "@/components/digital-invites/invite-card";
import { FloatingWhatsApp } from "@/components/ui/floating-whatsapp";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
    params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params;
    const titles: Record<string, string> = {
        image: "E-Invites (Image) | Premium Digital Collection | Zubizo",
        video: "E-Invites (Video) | Animated Digital Collection | Zubizo",
        website: "E-Website Invites | Interactive Wedding Websites | Zubizo",
    };

    return {
        title: titles[category] || "Digital Invites | Zubizo",
        description: `Explore our premium collection of ${category} invitations for your special day.`,
    };
}

const CATEGORY_MAP: Record<string, { title: string, subtitle: string, categoryName: string }> = {
    image: {
        title: "Image E-Invites",
        subtitle: "Artisanal high-resolution designs crafted for elegant digital sharing.",
        categoryName: "Digital E-Invite"
    },
    video: {
        title: "Video E-Invites",
        subtitle: "Cinematic animations with custom music for a grand digital reveal.",
        categoryName: "Digital E-Invite"
    },
    website: {
        title: "E-Website Invites",
        subtitle: "Interactive, mobile-first websites with RSVP, maps, and your love story.",
        categoryName: "Premium E-Website"
    }
};

export default async function CategoryPage({ params }: Props) {
    const { category } = await params;
    
    if (!CATEGORY_MAP[category]) {
        return notFound();
    }

    const config = CATEGORY_MAP[category];

    await dbConnect();

    // 1. Fetch the category ID
    const categoryDoc = await Category.findOne({
        name: config.categoryName,
        isDeleted: false
    }).lean();

    if (!categoryDoc) {
        return notFound();
    }

    // 2. Build Query
    const query: any = {
        categoryId: categoryDoc._id,
        isDeleted: false,
        isActive: true,
    };

    // Filter by type within Digital E-Invite
    if (category === "image") {
        query.$or = [
            { videoUrl: { $exists: false } },
            { videoUrl: "" },
            { videoUrl: null }
        ];
    } else if (category === "video") {
        query.videoUrl = { $ne: "", $exists: true, $filter: (v: any) => v && v.trim() !== "" };
        // MongoDB doesn't support $filter inside find query like this, use regex or $ne/exists
        query.videoUrl = { $exists: true, $ne: "" };
    }

    const designs = await Design.find(query)
        .sort({ isTrending: -1, createdAt: -1 })
        .populate('categoryId')
        .lean();

    const serializedDesigns = JSON.parse(JSON.stringify(designs));

    return (
        <main className="min-h-screen bg-pearl-white">
            <LuxuryNavbar />

            {/* Header */}
            <section className="pt-32 pb-16 bg-white border-b border-charcoal/5">
                <div className="site-container px-4">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-lavender/40">
                        <Link href="/" className="hover:text-lavender transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/digital-invites" className="hover:text-lavender transition-colors">Digital Invites</Link>
                        <span>/</span>
                        <span className="text-charcoal">{category}</span>
                    </nav>

                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-serif text-charcoal mb-6">
                            {config.title}
                        </h1>
                        <p className="text-lg text-charcoal/50 font-medium leading-relaxed">
                            {config.subtitle}
                        </p>
                    </div>
                </div>
            </section>

            {/* Grid */}
            <section className="py-20">
                <div className="site-container px-4">
                    {designs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {serializedDesigns.map((design: any) => (
                                <InviteCard 
                                    key={design._id} 
                                    design={design} 
                                    showVideoIcon={category === "video"}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center">
                            <p className="text-2xl font-serif italic text-charcoal/20">No designs found in this category.</p>
                            <Link href="/digital-invites" className="mt-8 inline-block text-lavender font-bold text-xs uppercase tracking-widest border-b border-lavender/20 pb-1">Back to All Invites</Link>
                        </div>
                    )}
                </div>
            </section>

            <LuxuryFooter />
            <FloatingWhatsApp />
        </main>
    );
}
