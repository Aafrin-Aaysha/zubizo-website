"use client";

import * as React from "react";
import { motion, useAnimationControls } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Instagram } from "lucide-react";

export const TrendingRow = ({ data, styling, title, subtitle }: any) => {
    const [designs, setDesigns] = React.useState<any[]>(data?.designs || []);
    const [isLoading, setIsLoading] = React.useState(!data?.designs);
    const scrollControls = useAnimationControls();
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (data?.designs) return;

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
    }, [data?.designs]);

    const scroll = (direction: 'left' | 'right') => {
        if (!containerRef.current) return;
        const scrollAmount = 400;
        containerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    if (!isLoading && designs.length === 0) {
        return (
            <section
                className="py-24 bg-soft-white text-center"
                style={{ backgroundColor: styling?.backgroundColor }}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold font-serif text-charcoal mb-4">Discover Our Full Collection</h2>
                    <p className="text-gray-500 mb-8">Premium handcrafted designs for every occasion.</p>
                    <Link href="/catalog" className="inline-block px-10 py-4 bg-lavender text-white rounded-full font-bold shadow-lg hover:shadow-lavender/40 transition-all">
                        Browse Catalogue
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section
            id="trending"
            className="py-10 md:py-12 overflow-hidden relative"
            style={{
                backgroundColor: styling?.backgroundColor || 'var(--color-pearl-white)',
                padding: styling?.padding || '40px 0'
            }}
        >
            <div className="mx-auto max-w-[1200px] px-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center md:text-left mb-8 md:mb-0 px-4"
                >
                    <span
                        className="font-sans text-[12px] font-semibold uppercase tracking-widest text-lavender mb-4 block"
                        style={{ color: styling?.accentColor }}
                    >
                        {subtitle || "SOCIAL SHOWCASE"}
                    </span>
                    <h2
                        className="text-[36px] font-medium text-charcoal font-serif"
                        style={{ color: styling?.textColor }}
                    >
                        {title || "Trending on Instagram"}
                    </h2>
                </motion.div>

                {/* Navigation Arrows */}
                <div className="flex gap-4">
                    <button
                        onClick={() => scroll('left')}
                        className="w-12 h-12 rounded-full border border-charcoal/10 flex items-center justify-center text-charcoal hover:bg-lavender hover:text-white hover:border-lavender transition-all shadow-sm"
                        aria-label="Previous"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-12 h-12 rounded-full border border-charcoal/10 flex items-center justify-center text-charcoal hover:bg-lavender hover:text-white hover:border-lavender transition-all shadow-sm"
                        aria-label="Next"
                    >
                        <ChevronRight size={20} />
                    </button>
                    <a
                        href="https://www.instagram.com/zubizo._art?igsh=MWtjcjN3Y2JjbW9pag=="
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-charcoal text-white flex items-center justify-center hover:bg-lavender transition-all shadow-lg"
                        title="Follow us on Instagram"
                        style={{ backgroundColor: styling?.textColor }}
                    >
                        <Instagram size={20} />
                    </a>
                </div>
            </div>

            {/* Infinite Scrolling Row with Manual Override */}
            <div className="relative">
                <div
                    ref={containerRef}
                    className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-10 px-8"
                >
                    <motion.div
                        className="flex gap-8 whitespace-nowrap"
                        animate={{
                            x: [0, -1 * (designs.length * 350 + designs.length * 32)],
                        }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: data?.autoplaySpeed || 25, // Slower 25s loop
                                ease: "linear",
                            },
                        }}
                        whileHover={{ animationPlayState: "paused" }}
                        style={{ width: "max-content" }}
                    >
                        {/* Display items twice for infinite effect */}
                        {[...designs, ...designs].map((design, idx) => (
                            <Link
                                key={`${design._id}-${idx}`}
                                href={`/catalog/${design.slug}`}
                                className="group relative w-[320px] md:w-[350px] aspect-[3/4] floating-card overflow-hidden shrink-0 snap-center"
                                style={{ borderRadius: styling?.borderRadius || '1rem' }}
                            >
                                <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-[1.03]">
                                    {design.videoUrl ? (
                                        <video
                                            src={design.videoUrl}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={design.images?.[0] || "/placeholder.jpg"}
                                            alt={design.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>

                                {/* Bottom Gradient Overlay (Strong impact for extreme readability) */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.2) 40%, transparent 65%)"
                                    }}
                                />

                                {/* Text Container */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90 mb-2">
                                        {design.sku}
                                    </p>
                                    <h3
                                        className="font-serif leading-tight mb-1"
                                        style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}
                                    >
                                        {design.name}
                                    </h3>
                                    <p className="font-medium text-white/90" style={{ fontSize: '13px' }}>
                                        {design.categoryId?.name || "Wedding Collection"}
                                    </p>
                                </div>

                                {design.videoUrl && (
                                    <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-60">
                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
