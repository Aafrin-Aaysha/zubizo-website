"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [current, slides.length]);

    const imageVariants = {
        enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 30 : -30, scale: 0.95 }),
        center: { opacity: 1, x: 0, scale: 1 },
        exit: (dir: number) => ({ opacity: 0, x: dir < 0 ? 30 : -30, scale: 0.95 }),
    };

    return (
        <section
            className="relative w-full overflow-hidden"
            style={{
                backgroundColor: styling?.backgroundColor || '#faf9fb', // Pearl white tone
                paddingTop: '160px',
                paddingBottom: '40px',
            }}
        >
            <div className="w-full max-w-[1300px] mx-auto px-6 sm:px-8 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left: Editorial Text Content */}
                    <div className="flex flex-col items-start justify-center text-left order-2 lg:order-1">
                        <div className="max-w-xl">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="inline-block font-script text-3xl sm:text-4xl text-lavender mb-6"
                            >
                                {data?.label || "Bespoke Invitation Atelier"}
                            </motion.span>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-[44px] sm:text-[56px] lg:text-[72px] font-semibold text-charcoal leading-[1.1] tracking-tight font-serif mb-6 whitespace-pre-line"
                                style={{ color: styling?.textColor || '#2e2e2e' }}
                            >
                                {slides[current]?.title || "Crafting Invitations That Tell Your Story"}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="text-[16px] lg:text-[18px] text-charcoal/70 font-medium leading-relaxed mb-10 whitespace-pre-line"
                            >
                                {slides[current]?.subtitle || "Experience the pinnacle of luxury with handcrafted stationery. Every piece is meticulously designed with premium materials to capture the essence of your most beautiful moments."}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="flex flex-col sm:flex-row items-center justify-start gap-4 w-full sm:w-auto"
                            >
                                <Link
                                    href="/catalog"
                                    className="w-full sm:w-auto h-14 px-8 bg-lavender text-white rounded-full font-bold text-[15px] hover:bg-lavender/90 transition-all duration-300 flex items-center justify-center gap-2 group shadow-premium hover:shadow-luxury hover:-translate-y-1"
                                >
                                    Explore Catalogue
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="#trending"
                                    className="w-full sm:w-auto h-14 px-8 bg-transparent border-2 border-lavender/20 text-charcoal rounded-full font-bold text-[15px] hover:border-lavender hover:text-lavender transition-all duration-300 flex items-center justify-center hover:-translate-y-1"
                                >
                                    View Trending
                                </Link>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right: Framed Image Content */}
                    <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="relative w-full max-w-[500px] aspect-[4/5] rounded-[2rem] floating-card overflow-hidden shadow-luxury border-4 border-white group bg-gray-50 drop-shadow-2xl"
                        >
                            <AnimatePresence custom={direction} mode="wait">
                                <motion.div
                                    key={current}
                                    custom={direction}
                                    variants={imageVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                    className="absolute inset-0"
                                >
                                    <img
                                        src={slides[current].image}
                                        alt="Luxury Invitation"
                                        className="h-full w-full object-cover transition-transform duration-[10s] group-hover:scale-105"
                                    />
                                    {/* Exceedingly subtle overlay just to make images pop slightly */}
                                    <div className="absolute inset-0 bg-black/5" />
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation controls for image frame */}
                            {slides.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button onClick={prev} className="p-1.5 hover:text-lavender text-charcoal/60 transition-colors rounded-full hover:bg-lavender/5">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <div className="flex gap-2">
                                        {slides.map((_: any, i: number) => (
                                            <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", current === i ? "bg-lavender w-4" : "bg-charcoal/20")} />
                                        ))}
                                    </div>
                                    <button onClick={next} className="p-1.5 hover:text-lavender text-charcoal/60 transition-colors rounded-full hover:bg-lavender/5">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
};
