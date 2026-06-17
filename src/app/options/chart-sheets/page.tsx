import React from "react";
import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Chart Sheets | Options | Zubizo",
    description: "Explore our chart sheet material options.",
};

const CHART_TYPES = [
    { name: "Premium Matte", img: "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&q=80&w=600&h=400" },
    { name: "Textured Silk", img: "https://images.unsplash.com/photo-1603503373111-e6e22ba812de?auto=format&fit=crop&q=80&w=600&h=400" },
    { name: "Metallic Pearl", img: "https://images.unsplash.com/photo-1510626359518-da1423405781?auto=format&fit=crop&q=80&w=600&h=400" },
];

export default function ChartSheetsPage() {
    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <LuxuryNavbar />
            <div className="pt-32 pb-20">
                <div className="site-container">
                    <Link href="/catalog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#6E4B8B] transition-colors mb-8 font-bold uppercase tracking-wider">
                        <ArrowLeft size={16} /> Back to Catalog
                    </Link>

                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h1 className="text-4xl md:text-5xl font-serif text-[#6E4B8B] mb-4">Chart Sheets</h1>
                        <p className="text-slate-600 mb-6">Select the finest paper materials for your design's foundation.</p>
                        <div className="inline-block bg-[#6E4B8B]/10 text-[#6E4B8B] px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide">
                            Note: Prices vary for different color variants and sizes.
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {CHART_TYPES.map((type) => (
                            <div key={type.name} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                <div className="aspect-[4/3] overflow-hidden">
                                    <img src={type.img} alt={type.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-serif text-[#6E4B8B]">{type.name}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <LuxuryFooter />
        </main>
    );
}
