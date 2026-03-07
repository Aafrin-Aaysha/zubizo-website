"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const FeaturedCarousel = () => {
    const [designs, setDesigns] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // Fetch top 8 designs as featured
                const res = await fetch('/api/designs?limit=8');
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
        <section className="py-32 bg-white overflow-hidden">
            <div className="mx-auto max-w-7xl px-8 mb-16 flex items-end justify-between">
                <div>
                    <span className="text-lavender font-black uppercase tracking-[0.4em] text-[10px] mb-3 block">
                        Curated Selection
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-charcoal font-serif">
                        Featured Designs
                    </h2>
                </div>
                <Link href="/catalog" className="text-xs font-black uppercase tracking-widest text-charcoal/40 hover:text-lavender transition-colors flex items-center gap-2 group">
                    View All Collections
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="relative">
                <div className="flex gap-10 animate-scroll hover:[animation-play-state:paused]"
                    style={{
                        width: "max-content",
                        "--scroll-width": `calc(-450px * ${designs.length} - 2.5rem * ${designs.length})`
                    } as React.CSSProperties}
                >
                    {isLoading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="w-[450px] aspect-[16/10] bg-gray-50 rounded-[2rem] animate-pulse" />
                        ))
                    ) : (
                        <>
                            {[...designs, ...designs].map((design, idx) => (
                                <Link
                                    key={`${design._id}-${idx}`}
                                    href={`/catalog/${design.slug}`}
                                    className="group relative w-[450px] aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-gray-50 shadow-luxury hover:shadow-2xl transition-all duration-700"
                                >
                                    <img
                                        src={design.images?.[0] || "/placeholder.jpg"}
                                        alt={design.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-lavender mb-2">{design.sku}</p>
                                        <h3 className="text-2xl font-black font-serif mb-1">{design.name}</h3>
                                        <p className="text-sm font-medium text-white/70">From ₹{design.packages?.[0]?.pricePerCard || design.basePrice || 0}</p>
                                    </div>

                                    {/* Glass Badge */}
                                    <div className="absolute top-6 right-6 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Featured</span>
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
