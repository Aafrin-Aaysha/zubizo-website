"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { DesignCard } from "@/components/ui/design-card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getStartingPrice } from "@/lib/utils";

const trendingDesigns = [
    {
        id: 1,
        title: "Wedding Collection",
        category: "Wedding Specials",
        description: "Timeless elegance for your special day.",
        imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop",
        isTrending: true,
    },
    {
        id: 2,
        title: "Festival Designs",
        category: "Festival Specials",
        description: "Celebrate joy with colors and tradition.",
        imageUrl: "https://images.unsplash.com/photo-1550005814-0ec78598460e?q=80&w=800&auto=format&fit=crop",
        isTrending: true,
    },
    {
        id: 3,
        title: "Event Invitations",
        category: "Corporate & Social",
        description: "Modern stationery for corporate & social events.",
        imageUrl: "https://images.unsplash.com/photo-1607197143003-7cb75960098f?q=80&w=800&auto=format&fit=crop",
        isTrending: true,
    },
];

const TrendingSection = () => {
    const [designs, setDesigns] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch('/api/designs?isTrending=true');
                if (res.ok) {
                    const data = await res.json();
                    setDesigns(data);
                }
            } catch (error) {
                console.error("Failed to fetch trending designs:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrending();
    }, []);

    if (!isLoading && designs.length === 0) return null;

    return (
        <section id="trending" className="bg-white py-24 sm:py-32 overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.4em] text-lavender">
                            Curated Selection
                        </span>
                        <h2 className="text-4xl font-bold tracking-tight text-charcoal sm:text-5xl font-serif">
                            Trending This Season
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="mt-4 md:mt-0"
                    >
                        <Link
                            href="/catalog"
                            className="group inline-flex items-center text-sm font-bold text-lavender transition-all hover:gap-1"
                        >
                            View All Styles
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 px-4 sm:px-12 md:px-24">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-[2.5rem]" />
                        ))
                    ) : (
                        designs
                            .filter((d, index, self) => self.findIndex(t => t._id === d._id) === index) // Safety check for duplicates
                            .map((design) => (
                                <DesignCard
                                    key={design._id}
                                    id={design.slug}
                                    variant="overlay"
                                    title={design.name}
                                    category={design.categoryId?.name || "Stationery"}
                                    description={design.description}
                                    imageUrl={design.images?.[0] || ""}
                                    price={getStartingPrice(design)}
                                    isTrending={design.isTrending}
                                    isNew={design.isNewCollection}
                                />
                            ))
                    )}
                </div>
            </div>
        </section>
    );
};

export { TrendingSection };
