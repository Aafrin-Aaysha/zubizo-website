import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";
import { WhatsAppFixed } from "@/components/ui/whatsapp-fixed";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import dbConnect from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import HomePageSection from "@/models/HomePageSection";
import { bootstrapSections } from "@/lib/bootstrap-homepage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getSections() {
  try {
    await dbConnect();
    let sections = await HomePageSection.find({}).sort({ order: 1 });

    // Auto-bootstrap for initial run if DB is empty
    if (sections.length === 0) {
      await HomePageSection.insertMany(bootstrapSections);
      sections = await HomePageSection.find({}).sort({ order: 1 });
    }

    return JSON.parse(JSON.stringify(sections));
  } catch (error) {
    console.error("Failed to fetch homepage sections:", error);
    return []; // Return empty sections as fallback
  }
}

export async function generateMetadata(): Promise<Metadata> {
  let settings = null;
  try {
    await dbConnect();
    settings = await SiteSettings.findOne();
  } catch (error) {
    console.error("Failed to fetch site settings for metadata:", error);
  }

  return {
    title: "Zubizo | Premier Handcrafted Invitations & Luxury Stationery",
    description: settings?.homeTagline || "Explore our collection of handcrafted wedding, nikah, and event invitations. Elegant designs customized for your special story.",
    openGraph: {
      title: "Zubizo | Handcrafted Invitations & Stationery",
      description: "Crafting Invitations That Tell Your Story.",
      images: [settings?.logoUrl || "/logo.png"],
    }
  };
}

export default async function Home() {
  let sections = [];
  let settings = null;

  try {
    sections = await getSections();
    settings = await SiteSettings.findOne().lean();
  } catch (error) {
    console.error("Error in Home component:", error);
  }

  return (
    <main className="relative min-h-screen">
      <LuxuryNavbar />
      <SectionRenderer
        sections={sections}
        siteSettings={settings ? JSON.parse(JSON.stringify(settings)) : null}
      />
      <LuxuryFooter />
      <WhatsAppFixed />
    </main>
  );
}
