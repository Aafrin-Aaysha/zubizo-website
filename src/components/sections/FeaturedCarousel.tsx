"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const FeaturedCarousel = ({ styling, title, subtitle, description }: any) => {
    const [designs, setDesigns] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await fetch('/api/designs?limit=4');
                if (res.ok) {
                    const data = await res.json();
                    setDesigns(data);
                }
            } catch (error) {
                console.error("Failed to fetch featured designs:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    if (!isLoading && designs.length === 0) return null;

    return (
        <section
            className="py-16 md:py-20"
            style={{ backgroundColor: styling?.backgroundColor }}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <span className="font-sans text-[12px] font-semibold uppercase tracking-widest text-lavender mb-4 block">
                        {subtitle || "CURATED COLLECTION"}
                    </span>
                    <h2 className="text-[36px] font-medium text-charcoal font-serif mb-4">
                        {title || "Featured Designs"}
                    </h2>
                    {description && (
                        <p className="text-charcoal/60 font-sans text-sm max-w-xl leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
                <Link href="/catalog" className="text-sm font-bold uppercase tracking-widest text-charcoal/60 hover:text-lavender transition-colors flex items-center gap-2 group pb-2">
                    View All <span className="hidden sm:inline">Collections</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            {/* Responsive Grid Layout */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16">
                    {isLoading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-4">
                                <div className="w-full aspect-[3/4] bg-gray-50 rounded-[1.5rem] animate-pulse" />
                                <div className="h-6 w-3/4 bg-gray-50 rounded animate-pulse" />
                                <div className="h-4 w-1/4 bg-gray-50 rounded animate-pulse" />
                            </div>
                        ))
                    ) : (
                        <>
                            {designs.map((design, idx) => (
                                <Link
                                    key={`${design._id}-${idx}`}
                                    href={`/catalog/${design.slug}`}
                                    className="group flex flex-col"
                                >
                                    {/* Image Container */}
                                    <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[1.5rem] shadow-sm group-hover:shadow-premium transition-shadow duration-500 bg-gray-50 mb-5">
                                        <img
                                            src={design.images?.[0] || "/placeholder.jpg"}
                                            alt={design.name}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        />

                                        {/* Glass Badge */}
                                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/40 backdrop-blur-md border border-white/40 rounded-full shadow-sm">
                                            <span className="text-[9px] font-bold text-charcoal uppercase tracking-widest font-sans">Featured</span>
                                        </div>
                                    </div>

                                    {/* Content Container Below Image */}
                                    <div className="flex pl-1 flex-col">
                                        <h3 className="text-[18px] md:text-[20px] font-serif font-medium text-charcoal group-hover:text-lavender transition-colors decoration-1 underline-offset-4 group-hover:underline line-clamp-1">
                                            {design.name}
                                        </h3>

                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-[14px] font-sans text-charcoal/70">
                                                From ₹{design.packages?.[0]?.pricePerCard || design.basePrice || 0}
                                            </p>
                                        </div>

                                        <div className="text-[13px] font-sans font-semibold text-lavender flex items-center gap-1 mt-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                            View Details
                                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};
