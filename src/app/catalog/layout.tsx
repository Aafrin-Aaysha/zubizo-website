import { Metadata } from "next";
import dbConnect from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";

export async function generateMetadata(): Promise<Metadata> {
    await dbConnect();
    const settings = await SiteSettings.findOne();

    return {
        title: "Catalogue | Zubizo Handcrafted Invitations",
        description: "Browse our exclusive collection of luxury wedding invitations, traditional Nikah cards, and elegant stationery. Handcrafted with love by Zubizo.",
        openGraph: {
            title: "Zubizo Design Catalogue",
            description: "Explore premium handcrafted invitations for your special day.",
            images: [settings?.logoUrl || "/logo.png"],
        }
    };
}

export default function CatalogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
