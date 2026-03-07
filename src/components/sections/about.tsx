"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export const AboutSection = () => {
    const [settings, setSettings] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings', { cache: 'no-store' });
                const data = await res.json();
                if (res.ok) setSettings(data);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
            <div className="flex flex-col items-center text-center space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl space-y-8"
                >
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lavender mb-2 block">Our Story</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 font-serif leading-tight">
                            Crafting Memories <span className="text-lavender italic block sm:inline">With Every Detail</span>
                        </h2>
                        <div className="mt-6 h-1 w-24 bg-gradient-to-r from-lavender to-transparent rounded-full" />
                    </div>

                    <div className="space-y-6 text-lg text-gray-500 font-light leading-relaxed">
                        <div className="flex flex-col items-center gap-4 mb-8">
                            <div className="relative h-16 w-16 rounded-2xl overflow-hidden shadow-sm border border-lavender/10 bg-lavender/5 flex items-center justify-center">
                                {settings?.logoUrl ? (
                                    <Image
                                        src={settings.logoUrl}
                                        alt="Brand Seal"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="text-xl font-bold text-lavender font-serif">Z</span>
                                )}
                            </div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Authentic Craftsmanship</p>
                        </div>
                        <p>
                            Zubizo was born from a simple yet profound belief: that the most extraordinary moments in life deserve to be announced with unparalleled elegance.
                        </p>
                        <p>
                            Based on a heritage of fine art and premium craftsmanship, we've evolved into a boutique stationery studio that blends traditional aesthetics with contemporary luxury. Each piece we create is a testament to our obsession with quality.
                        </p>
                        <p>
                            From the choice of premium Italian papers to the precision of our foil stamping, every element is curated to reflect your unique story. At Zubizo, we don't just print cards; we create a prelude to your most cherished celebrations.
                        </p>
                    </div>

                    <div className="pt-4 flex items-center justify-center gap-12 sm:gap-20">
                        <div className="text-center">
                            <span className="block text-2xl sm:text-3xl font-black text-gray-900">10+</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Years Experience</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-2xl sm:text-3xl font-black text-gray-900">5k+</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Happy Clients</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
