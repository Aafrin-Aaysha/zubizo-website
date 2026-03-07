"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_SLIDES = [
    {
        image: "/zubizo_invites/3.jpeg",
        title: "Crafting Invitations\nThat Tell Your Story",
        subtitle: "Luxury handcrafted stationery designed\nwith elegance and timeless detail.",
    },
    {
        image: "/zubizo_invites/4.jpeg",
        title: "A Timeless Beginning\nFor Your Love",
        subtitle: "Bespoke designs that capture the essence\nof your most beautiful moments.",
    },
    {
        image: "/zubizo_invites/7.jpeg",
        title: "Excellence in\nEvery Detail",
        subtitle: "Premium materials and unmatched\ncraftsmanship for your special day.",
    }
];

export const LuxuryHero = ({ data, styling }: any) => {
    const slides = data?.slides || DEFAULT_SLIDES;
    const [current, setCurrent] = React.useState(0);
    const [direction, setDirection] = React.useState(1);

    const next = () => {
        if (slides.length <= 1) return;
        setDirection(1);
        setCurrent((p) => (p + 1) % slides.length);
    };

    const prev = () => {
        if (slides.length <= 1) return;
        setDirection(-1);
        setCurrent((p) => (p - 1 + slides.length) % slides.length);
    };

    React.useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(next, 6000);
        return () => clearInterval(timer);
    }, [current, slides.length]);

    const variants = {
        enter: (dir: number) => ({
            opacity: 0,
            scale: 1.05,
        }),
        center: {
            opacity: 1,
            scale: 1,
        },
        exit: (dir: number) => ({
            opacity: 0,
            scale: 0.95,
        }),
    };

    return (
        <section
            className="relative w-full overflow-hidden"
            style={{
                backgroundColor: styling?.backgroundColor || '#faf9f7',
                paddingTop: '120px',
                paddingBottom: '120px',
                paddingLeft: '1rem',
                paddingRight: '1rem'
            }}
        >
            {/* The Main Banner Container */}
            <div className="relative w-full max-w-[1440px] mx-auto h-[85vh] min-h-[600px] rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden shadow-2xl shadow-charcoal/10">
                {/* Slides */}
                <AnimatePresence custom={direction} mode="popLayout">
                    <motion.div
                        key={current}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0"
                    >
                        <img
                            src={slides[current].image}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                        {/* Elegant Overlay - Stronger for better text visibility */}
                        <div
                            className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/30"
                            style={{ opacity: styling?.overlayOpacity }}
                        />
                        <div className="absolute inset-0 bg-charcoal/30 backdrop-brightness-75" />
                    </motion.div>
                </AnimatePresence>

                {/* Content Overlay */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-4xl"
                    >
                        <span className="inline-block text-[13px] font-black uppercase tracking-[0.6em] !text-white/90 mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                            {slides[current].tag || "Bespoke Invitation Atelier"}
                        </span>

                        <h1
                            className="text-4xl sm:text-6xl font-black !text-white leading-[1.1] tracking-tight font-serif mb-8 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] whitespace-pre-line"
                            style={{ color: styling?.textColor || 'white' }}
                        >
                            {slides[current].title}
                        </h1>

                        <p className="text-sm sm:text-base !text-white/95 font-semibold leading-relaxed max-w-xl mx-auto mb-10 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] whitespace-pre-line">
                            {slides[current].subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                            <Link
                                href="/catalog"
                                className="h-12 px-8 bg-[#9C7AE6] text-white rounded-xl font-bold text-sm hover:bg-[#8B69D5] transition-all duration-300 flex items-center justify-center gap-2 group tracking-wide shadow-lg shadow-lavender/25"
                            >
                                Explore Catalogue
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="#trending"
                                className="h-12 px-8 bg-white/10 backdrop-blur-md border border-white/40 text-white rounded-xl font-bold text-sm hover:bg-white hover:text-charcoal transition-all duration-300 flex items-center justify-center tracking-wide"
                            >
                                View Trending
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Navigation Controls */}
                {slides.length > 1 && (
                    <>
                        {/* Navigation Arrows */}
                        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none">
                            <button
                                onClick={prev}
                                className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-charcoal transition-all pointer-events-auto transform hover:scale-110 active:scale-95"
                            >
                                <ChevronLeft size={28} />
                            </button>
                            <button
                                onClick={next}
                                className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-charcoal transition-all pointer-events-auto transform hover:scale-110 active:scale-95"
                            >
                                <ChevronRight size={28} />
                            </button>
                        </div>

                        {/* Pagination Dots */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
                            {slides.map((_: any, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={cn(
                                        "h-1.5 transition-all duration-500 rounded-full",
                                        current === i ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                                    )}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};
