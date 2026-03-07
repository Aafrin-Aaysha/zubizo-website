"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section className="relative h-screen w-full overflow-hidden bg-white">
            {/* Subtle Gradient Background */}
            <motion.div
                style={{ y: y1 }}
                className="absolute inset-0 z-0 flex items-center justify-center"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-lavender/5 via-white to-gold/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-lavender/10 rounded-full blur-[120px] opacity-30" />
            </motion.div>

            {/* Background Texture/Image (Subtle) */}
            <div className="absolute inset-0 z-0 opacity-[0.03] mix-blend-multiply pointer-events-none">
                <Image
                    src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2000&auto=format&fit=crop"
                    alt="Background Texture"
                    fill
                    className="object-cover"
                />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl text-center"
                    style={{ opacity }}
                >
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6 inline-block text-[10px] font-black uppercase tracking-[0.5em] text-charcoal/30"
                    >
                        Zubizo Invitation Studio
                    </motion.span>

                    <h1 className="mb-12 text-5xl sm:text-6xl font-black leading-[1.1] tracking-tight text-charcoal md:text-8xl lg:text-9xl font-serif text-balance">
                        Crafting Artisanal Invitations <br />
                        <span className="text-lavender/40 font-light">For Luxury Studios</span>
                    </h1>

                    <div className="flex flex-col items-center justify-center">
                        <Link href="/catalog">
                            <Button size="lg" className="min-w-[280px] h-16 text-xs uppercase tracking-[0.2em] font-black bg-charcoal hover:bg-lavender text-white rounded-2xl shadow-2xl shadow-charcoal/20 transition-all hover:scale-105 active:scale-95">
                                Explore Our Collection
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Refined Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="absolute bottom-12 flex flex-col items-center"
                >
                    <div className="w-px h-16 bg-gradient-to-b from-lavender/50 to-transparent" />
                </motion.div>
            </div>
        </section>
    );
};

export { Hero };
