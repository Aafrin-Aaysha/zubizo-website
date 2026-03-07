"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const priceSlabs = [
    {
        label: "Under ₹30",
        range: "under30",
        image: "/zubizo_invites/5.jpeg",
    },
    {
        label: "Under ₹60",
        range: "under60",
        image: "/zubizo_invites/19.jpeg",
    },
    {
        label: "Under ₹90",
        range: "under90",
        image: "/zubizo_invites/27.jpeg",
    },
    {
        label: "₹120+",
        range: "premium",
        image: "/zubizo_invites/42.jpeg",
    },
];

export const PriceSlabs = () => {
    return (
        <section className="py-24 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-lavender font-bold uppercase tracking-[0.4em] text-[10px] mb-2 block">
                        Find Your Perfect Match
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-charcoal font-serif mb-4">
                        Shop by Price
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Discover elegant designs that fit your budget perfectly.
                    </p>
                </motion.div>

                {/* Price Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {priceSlabs.map((slab, idx) => (
                        <motion.div
                            key={slab.range}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link
                                href={`/catalog?priceRange=${slab.range}`}
                                className="group block relative overflow-hidden rounded-3xl border border-gray-100 hover:border-lavender/30 transition-all hover:shadow-luxury"
                            >
                                {/* Image Container */}
                                <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                                    <img
                                        src={slab.image}
                                        alt={slab.label}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                                </div>

                                {/* Content Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <h3 className="text-2xl font-bold font-serif mb-2 group-hover:translate-y-[-4px] transition-transform">
                                        {slab.label}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                        Browse Collection
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                {/* Accent Border */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-lavender scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
