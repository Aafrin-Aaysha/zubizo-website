"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const HERO_IMAGES = [
    "/img1.jpg",
    "/img2.jpg",
    "/img3.jpg",
    "/img4.jpg",
    "/img5.jpg",
    "/img7.jpg",
    "/img8.jpg",
    "/img9.jpg",
    "/img10.jpg",
    "/img11.jpg",
];

export const CenteredHero = ({ data, styling }: any) => {
    const [current, setCurrent] = React.useState(0);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 4500);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
            {/* Background Carousel */}
            <AnimatePresence mode="sync">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src={HERO_IMAGES[current]}
                        alt="Premium Wedding Invitation"
                        className="w-full h-full object-cover object-center"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Dark Gradient Overlay */}
            <div
                className="absolute inset-0 z-10"
                style={{ background: "linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.60))" }}
            />

            {/* Content — perfectly centered */}
            <div className="relative z-20 w-full flex flex-col items-center justify-center text-center px-6">
                {/* Tagline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="flex items-center gap-3 mb-6"
                >
                    <div className="h-[1px] w-8 bg-[#D6BFA3]" />
                    <span className="text-[#D6BFA3] font-semibold uppercase tracking-[0.4em] text-[10px] sm:text-xs">
                        {data?.tagline || "Bespoke Invitation Atelier"}
                    </span>
                    <div className="h-[1px] w-8 bg-[#D6BFA3]" />
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.18, ease: "easeOut" }}
                    className="font-serif font-semibold leading-tight tracking-tight mb-6 drop-shadow-lg"
                    style={{ fontSize: 'clamp(2.4rem, 7vw, 5rem)', lineHeight: 1.12, textShadow: '0 2px 12px rgba(0,0,0,0.6)', color: '#ae7fcb' }}
                >
                    {data?.titleLine1 || "A Timeless Beginning"}<br />
                    <span className="text-[#ae7fcb] italic" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>{data?.titleHighlight || "For Your Love"}</span>
                </motion.h1>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.36, ease: "easeOut" }}
                    className="text-white/90 text-base md:text-lg font-medium leading-relaxed mb-10 max-w-xl mx-auto"
                    style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
                >
                    {data?.description || "Bespoke designs that capture the essence of your most beautiful moments, crafted with artisanal precision."}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.54, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        href="/catalog"
                        className="group flex items-center justify-center gap-2 rounded-full bg-[#ae7fcb] text-[#1A1A1A] px-9 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:bg-[#9f6fc0] hover:scale-[1.03] active:scale-95 shadow-lg shadow-[#ae7fcb]/20"
                    >
                        Explore Catalogue
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                        href="#trending"
                        className="flex items-center justify-center rounded-full border-2 border-white/60 text-white px-9 py-[14px] text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:bg-white/10 hover:border-white hover:scale-[1.03] active:scale-95"
                    >
                        View Trending
                    </Link>
                </motion.div>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {HERO_IMAGES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`rounded-full transition-all duration-500 ${i === current ? 'w-6 h-1.5 bg-[#D6BFA3]' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'}`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};
