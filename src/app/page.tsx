import { RedesignedHome } from "@/components/sections/RedesignedHome";
import dbConnect from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import Design from "@/models/Design";
import Category from "@/models/Category";
import { getStartingPrice } from "@/lib/utils";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getHomeData() {
    try {
        await dbConnect();
        
        // 1. Fetch site settings
        const settings = await SiteSettings.findOne().lean();

        // 2. Fetch categories
        const categories = await Category.find({ isDeleted: false }).sort({ displayOrder: 1 }).lean();

        // 3. Fetch Best Sellers: designs flagged as isTrending
        const bestSellers = await Design.find({ isTrending: true, isDeleted: false, isActive: true })
            .populate('categoryId')
            .limit(4)
            .lean();

        // 4. Fetch New Arrivals: sorted by newest
        const newArrivals = await Design.find({ isNewArrival: true, isDeleted: false, isActive: true })
            .sort({ createdAt: -1 })
            .populate('categoryId')
            .limit(4)
            .lean();

        // Map Category Name helper
        const mapProducts = (products: any[]) => {
            return products.map(p => ({
                ...p,
                _id: p._id.toString(),
                categoryName: p.categoryId?.name || 'Wedding Invite',
                defaultPrice: getStartingPrice(p)
            }));
        };

        return {
            settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
            categories: JSON.parse(JSON.stringify(categories)),
            bestSellers: mapProducts(JSON.parse(JSON.stringify(bestSellers))),
            newArrivals: mapProducts(JSON.parse(JSON.stringify(newArrivals)))
        };
    } catch (error) {
        console.error("Failed to load home page data:", error);
        return {
            settings: null,
            categories: [],
            bestSellers: [],
            newArrivals: []
        };
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
    const { settings, categories, bestSellers, newArrivals } = await getHomeData();

    return (
        <main className="relative min-h-screen">
            <RedesignedHome 
                bestSellers={bestSellers} 
                newArrivals={newArrivals} 
                categories={categories}
                siteSettings={settings}
            />
        </main>
    );
}
