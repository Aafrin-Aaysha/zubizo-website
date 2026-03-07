"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import Image from "next/image";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[60vh] w-full overflow-hidden pt-20">
                <Image
                    src="https://images.unsplash.com/photo-1512413316925-fd47914c9c11?q=80&w=2000&auto=format&fit=crop"
                    alt="Art and Craft"
                    fill
                    className="object-cover opacity-30"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold text-charcoal sm:text-7xl font-serif"
                    >
                        The Heart of <br /> <span className="text-lavender italic">Zubizo</span>
                    </motion.h1>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="relative aspect-square overflow-hidden rounded-[3rem]"
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200"
                            alt="Crafting"
                            fill
                            className="object-cover"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div>
                            <h2 className="text-4xl font-bold text-charcoal font-serif">A Legacy of Art</h2>
                            <div className="mt-4 h-1 w-20 bg-lavender" />
                        </div>
                        <p className="text-lg text-charcoal/70 leading-relaxed font-sans">
                            At Zubizo, we believe an invitation is more than just paper—it's a prelude to a
                            beautiful memory. Our journey began with a simple passion for art and craft,
                            transitioning into a premier destination for luxury stationary.
                        </p>
                        <p className="text-lg text-charcoal/70 leading-relaxed font-sans">
                            Every stroke of our designs is meticulously crafted to reflect your personal
                            story. We combine traditional techniques with modern aesthetics to produce
                            extraordinary invitation cards that leave a lasting impression.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="bg-soft-grey py-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                    >
                        <h2 className="text-4xl font-bold text-charcoal font-serif italic">Our Mission</h2>
                        <p className="mt-8 text-2xl text-charcoal/80 font-medium font-serif leading-relaxed">
                            "To transform moments of celebration into enduring art through premium craftsmanship and visionary design."
                        </p>
                    </motion.div>
                </div>
            </section>

            <footer className="bg-charcoal py-16 text-white/60">
                <div className="mx-auto max-w-7xl px-4 text-center">
                    <p className="text-xl font-bold text-white font-serif">ZUBIZO</p>
                    <p className="mt-2 text-xs">© 2024 Zubizo – Invitation Stationary.</p>
                </div>
            </footer>
        </main>
    );
}
