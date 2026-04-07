import * as React from "react";
import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";
import dbConnect from "@/lib/db";
import Design from "@/models/Design";
import Category from "@/models/Category";
import { Metadata } from "next";
import { DigitalInvitesHero } from "@/components/digital-invites/hero";
import { CategoryNavigation } from "@/components/digital-invites/category-nav";
import { InviteSection } from "@/components/digital-invites/invite-section";
import { WebsiteShowcase } from "@/components/digital-invites/website-showcase";
import { PricingSection } from "@/components/digital-invites/pricing";
import { WhyChooseUs } from "@/components/digital-invites/why-choose-us";
import { FinalCTA } from "@/components/digital-invites/final-cta";
import { FloatingWhatsApp } from "@/components/ui/floating-whatsapp";
import { SectionNavigation } from "@/components/digital-invites/section-nav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Digital Wedding Invitations | Premium E-Invites & Websites | Zubizo",
    description: "Elegant, interactive, and affordable digital invites for your special day. Choose from high-resolution E-Invites or interactive, mobile-friendly E-Websites.",
};

export default async function DigitalInvitesPage() {
    await dbConnect();

    // 1. Find relevant categories
    const categories = await Category.find({
        name: { $in: ["Digital E-Invite", "Premium E-Website"] },
        isDeleted: false
    });
    
    const categoryIds = categories.map(c => c._id);

    // 2. Fetch all Designs for these categories
    const designs = await Design.find({
        categoryId: { $in: categoryIds },
        isDeleted: false,
        isActive: true,
    })
    .sort({ isTrending: -1, createdAt: -1 })
    .populate('categoryId')
    .lean();

    // 3. Filter designs by sub-category
    const serializedDesigns = JSON.parse(JSON.stringify(designs));
    
    const imageDesigns = serializedDesigns.filter((d: any) => 
        d.categoryId.name === "Digital E-Invite" && (!d.videoUrl || d.videoUrl.trim() === "")
    );
    
    const videoDesigns = serializedDesigns.filter((d: any) => 
        d.categoryId.name === "Digital E-Invite" && d.videoUrl && d.videoUrl.trim() !== ""
    );
    
    const websiteDesigns = serializedDesigns.filter((d: any) => 
        d.categoryId.name === "Premium E-Website"
    );

    return (
        <main className="min-h-screen bg-pearl-white">
            <LuxuryNavbar />
            
            <SectionNavigation />

            <DigitalInvitesHero />

            <CategoryNavigation />



            <PricingSection />

            <WhyChooseUs />

            <FinalCTA />

            <LuxuryFooter />
            
            <FloatingWhatsApp />
        </main>
    );
}
