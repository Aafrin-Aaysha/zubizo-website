"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CinematicHero = ({ data, styling }: any) => {
    return (
        <section className="relative w-full h-[90vh] min-h-[600px] flex items-center overflow-hidden bg-charcoal">
            {/* Background Image with Zoom Animation */}
            <motion.div 
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute inset-0 z-0"
            >
                <img 
                    src={data?.backgroundImage || "/zubizo_invites/25.jpeg"} 
                    alt="Premium Wedding Invitation" 
                    className="w-full h-full object-cover object-center"
                />
            </motion.div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-charcoal/90 via-charcoal/60 to-transparent md:from-charcoal/80 md:via-charcoal/40" />
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-charcoal/20" />

            {/* Decorative Light Shapes */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-lavender/20 rounded-full blur-[120px] z-10 animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-900/20 rounded-full blur-[120px] z-10 animate-pulse delay-1000" />

            {/* Content Container */}
            <div className="site-container relative z-20 w-full flex flex-col items-center md:items-start text-center md:text-left">
                <div className="max-w-4xl">
                    {/* Small Tagline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex items-center justify-center md:justify-start gap-2 mb-6"
                    >
                        <div className="h-[1px] w-8 bg-lavender" />
                        <span className="text-lavender font-bold uppercase tracking-[0.3em] text-[10px] sm:text-xs">
                            {data?.tagline || "Bespoke Invitation Atelier"}
                        </span>
                        <Sparkles size={14} className="text-lavender animate-pulse" />
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-white text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight font-serif mb-8"
                    >
                        {data?.titleLine1 || "A Timeless"} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-lavender/40 to-white/80">
                            {data?.titleHighlight || "Beginning"}
                        </span> {data?.titleLine2 || "For"} <br className="hidden md:block" />
                        {data?.titleLine3 || "Your Love"}
                    </motion.h1>

                    {/* Description with Glassmorphism */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="mb-12"
                    >
                        <p className="text-white/70 text-lg md:text-xl font-medium leading-relaxed max-w-xl backdrop-blur-sm bg-white/5 p-4 rounded-2xl border border-white/10">
                            {data?.description || "Bespoke designs that capture the essence of your most beautiful moments, crafted with artisanal precision and luxury materials."}
                        </p>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row items-center gap-6"
                    >
                        <Link
                            href="/catalog"
                            className="group relative w-full sm:w-auto overflow-hidden rounded-full bg-white px-10 py-5 text-sm font-black uppercase tracking-widest text-charcoal transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Explore Catalogue
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>

                        <Link
                            href="#trending"
                            className="group w-full sm:w-auto rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-md px-10 py-[18px] text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-white/40 active:scale-95"
                        >
                            <span className="flex items-center justify-center gap-2">
                                View Trending
                            </span>
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-4"
            >
                <span className="text-white/30 text-[10px] font-black uppercase tracking-widest vertical-text">Scroll</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-lavender to-transparent" />
            </motion.div>
        </section>
    );
};
