"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Leaf, Sparkles, Diamond, Crown } from "lucide-react";

const priceSlabs = [
    {
        title: "Under ₹30",
        description: "Beautiful and affordable handcrafted invitations for every celebration.",
        tag: "Budget-Friendly",
        href: "/catalog?maxPrice=30",
        icon: Leaf,
    },
    {
        title: "Under ₹60",
        description: "Elegant options with refined finishes and premium paper quality.",
        tag: "Most Popular",
        href: "/catalog?maxPrice=60",
        icon: Sparkles,
    },
    {
        title: "Under ₹90",
        description: "Luxurious designs with exquisite artisan detail and premium materials.",
        tag: "Premium Collection",
        href: "/catalog?maxPrice=90",
        icon: Diamond,
    },
    {
        title: "₹120+",
        description: "Bespoke couture and exclusive materials for the most special occasions.",
        tag: "Luxury Couture",
        href: "/catalog?minPrice=120",
        icon: Crown,
    },
];

export const ShopByPrice = ({ data, styling, title, subtitle, description }: any) => {
    const slabs = data?.slabs || priceSlabs;

    return (
        <div
            id="shop-by-price"
            className="relative"
            style={{
                backgroundColor: styling?.backgroundColor || '#FAF8F5',
            }}
        >
            <div className="w-full">
                <div className="text-center mb-8">
                    <span
                        className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] mb-4 block"
                        style={{ color: styling?.accentColor || '#D6BFA3' }}
                    >
                        {subtitle || "CURATED PRICE SLABS"}
                    </span>
                    <h2
                        className="text-[32px] font-medium text-charcoal font-serif mb-3"
                        style={{ color: styling?.textColor }}
                    >
                        {title || "Shop by Price"}
                    </h2>
                    <p className="font-sans text-[15px] font-medium text-[#6B6B6B] leading-relaxed max-w-xl mx-auto">
                        {description || "Discover invitation designs across every price range, crafted with elegance and premium materials."}
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {slabs.map((slab: any, idx: number) => {
                        const Icon = slab.icon || Sparkles;
                        return (
                            <motion.div
                                key={slab.href || idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                            >
                                <Link
                                    href={slab.href || `/catalog?price=${slab.priceParam}`}
                                    className="group block p-7 h-full rounded-2xl border border-[#EAE6DF] hover:border-[#D6BFA3] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(214,191,163,0.18)] hover:-translate-y-1"
                                    style={{ backgroundColor: '#F9F6F1' }}
                                >
                                    <div className="h-full flex flex-col justify-between min-h-[200px]">
                                        <div>
                                            {/* Icon */}
                                            <div className="w-11 h-11 rounded-full flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 bg-[#D6BFA3]/10">
                                                <Icon size={20} strokeWidth={1.5} className="text-[#D6BFA3]" />
                                            </div>
                                            <h3 className="text-xl font-semibold font-serif text-[#1A1A1A] mb-2">
                                                {slab.title}
                                            </h3>
                                            <p className="text-sm text-[#6B6B6B] leading-[1.7] max-w-[240px]">
                                                {slab.description}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] text-[#D6BFA3] tracking-[0.1em] uppercase font-semibold mt-4 mb-3">
                                                {slab.tag || slab.startingPrice}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#D6BFA3]">
                                                Explore
                                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
