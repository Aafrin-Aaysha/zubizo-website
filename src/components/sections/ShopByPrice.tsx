"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const priceSlabs = [
    {
        title: "Under ₹30",
        description: "Beautiful and affordable handcrafted invitations.",
        startingPrice: "Budget-Friendly",
        href: "/catalog?maxPrice=30",
        bgColor: "bg-[#F6F3FB]",
        backgroundColor: "#F6F3FB"
    },
    {
        title: "Under ₹60",
        description: "Elegant options with premium finishes.",
        startingPrice: "Most Popular",
        href: "/catalog?maxPrice=60",
        bgColor: "bg-[#EFE9F8]",
        backgroundColor: "#EFE9F8"
    },
    {
        title: "Under ₹90",
        description: "Luxurious designs with exquisite details.",
        startingPrice: "Premium Collection",
        href: "/catalog?maxPrice=90",
        bgColor: "bg-[#E9E0F6]",
        backgroundColor: "#E9E0F6"
    },
    {
        title: "₹120+",
        description: "Bespoke couture and exclusive materials.",
        startingPrice: "Luxury Couture",
        href: "/catalog?minPrice=120",
        bgColor: "bg-[#E2D6F3]",
        backgroundColor: "#E2D6F3"
    },
];

export const ShopByPrice = ({ data, styling, title, subtitle, description }: any) => {
    const slabs = data?.slabs || priceSlabs;

    return (
        <div
            id="shop-by-price"
            className="relative"
            style={{
                backgroundColor: styling?.backgroundColor || 'transparent',
            }}
        >
            <div className="w-full">
                <div className="text-center mb-8">
                    <span
                        className="font-sans text-[12px] font-semibold uppercase tracking-widest text-lavender mb-4 block"
                        style={{ color: styling?.accentColor }}
                    >
                        {subtitle || "CURATED PRICE SLABS"}
                    </span>
                    <h2
                        className="text-[36px] font-medium text-charcoal font-serif mb-4"
                        style={{ color: styling?.textColor }}
                    >
                        {title || "Shop by Price"}
                    </h2>
                    <p className="font-sans text-[15px] font-medium text-charcoal/70 leading-relaxed max-w-2xl mx-auto">
                        {description || "Discover invitation designs across every price range, crafted with elegance and premium materials."}
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[28px]">
                    {slabs.map((slab: any, idx: number) => (
                        <motion.div
                            key={slab.href || slab.priceParam || idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: idx * 0.1 }}
                        >
                            <Link
                                href={slab.href || `/catalog?price=${slab.priceParam}`}
                                className={cn(
                                    "group block p-8 h-full floating-card",
                                    slab.bgColor
                                )}
                                style={{
                                    backgroundColor: slab.backgroundColor, // Support for custom hex colors if provided
                                    borderRadius: styling?.borderRadius
                                }}
                            >
                                <div className="h-full flex flex-col justify-between min-h-[220px]">
                                    <div>
                                        <h3 className="text-2xl font-semibold font-serif text-charcoal mb-[10px]">
                                            {slab.title}
                                        </h3>
                                        <p className="text-sm text-neutral-600 leading-[1.6] max-w-[260px]">
                                            {slab.description}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-neutral-500 tracking-[0.05em] mt-[18px] mb-4">
                                            {slab.startingPrice}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm font-medium text-[#9C7AE6]" style={{ color: styling?.accentColor }}>
                                            Explore Collection
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
