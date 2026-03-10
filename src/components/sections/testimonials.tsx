"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
    {
        name: "Priya & Rahul",
        review: "Zubizo transformed our wedding invitations into works of art. The attention to detail and luxurious finish exceeded our expectations. Our guests couldn't stop talking about them!",
        location: "Chennai",
    },
    {
        name: "Ananya Menon",
        review: "The craftsmanship is simply unmatched. Every invitation felt personal and elegant. Zubizo captured the essence of our celebration perfectly.",
        location: "Bangalore",
    },
    {
        name: "Vikram & Divya",
        review: "From the first consultation to the final product, the experience was seamless. The team understood our vision and delivered beyond what we imagined. Truly premium quality!",
        location: "Mumbai",
    },
    {
        name: "Sneha & Arjun",
        review: "The custom monogram they created for us was breathtaking. The whole process was so smooth and the final result was sheer perfection.",
        location: "Delhi",
    }
];

export const Testimonials = ({ data, styling, title, subtitle }: any) => {
    const list = data?.testimonials?.length > 0 ? data.testimonials : testimonials;
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400; // approximate width of one card + gap
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div
            id="testimonials"
            className="relative overflow-hidden"
            style={{
                backgroundColor: styling?.backgroundColor || 'transparent',
            }}
        >
            <div className="w-full">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6"
                >
                    <div>
                        <span
                            className="font-sans text-[12px] font-semibold uppercase tracking-widest text-lavender mb-4 block"
                            style={{ color: styling?.accentColor }}
                        >
                            {subtitle || "CLIENT LOVE"}
                        </span>
                        <h2
                            className="text-[36px] font-medium text-charcoal font-serif"
                            style={{ color: styling?.textColor }}
                        >
                            {title || "Loved by Our Clients"}
                        </h2>
                    </div>

                    {/* Navigation Arrows */}
                    {list.length > 3 && (
                        <div className="flex gap-4">
                            <button
                                onClick={() => scroll('left')}
                                className="p-4 rounded-full border border-lavender/30 hover:border-lavender hover:bg-lavender hover:text-white transition-all text-charcoal/50 group shadow-sm hover:shadow-luxury"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft size={24} className="group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="p-4 rounded-full border border-lavender/30 hover:border-lavender hover:bg-lavender hover:text-white transition-all text-charcoal/50 group shadow-sm hover:shadow-luxury"
                                aria-label="Scroll right"
                            >
                                <ChevronRight size={24} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Testimonial Cards Carousel */}
                <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-8 pb-12 snap-x snap-mandatory hide-scrollbar"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {list.map((testimonial: any, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: Math.min(idx * 0.1, 0.5) }} // Cap delay
                                className="relative floating-card p-8 flex-none w-[85vw] sm:w-[400px] snap-center"
                                style={{ borderRadius: styling?.borderRadius }}
                            >
                                {/* Lavender Accent Line */}
                                <div
                                    className="absolute top-0 left-8 right-8 h-1 bg-lavender rounded-b-full"
                                    style={{ backgroundColor: styling?.accentColor }}
                                />

                                {/* Star Rating */}
                                <div className="flex gap-1 mb-6 mt-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} className="fill-lavender text-lavender" style={{ fill: styling?.accentColor, color: styling?.accentColor }} />
                                    ))}
                                </div>

                                {/* Review Text */}
                                <p className="text-charcoal/80 font-serif leading-relaxed mb-6 text-[16px] italic min-h-[100px]">
                                    "{testimonial.review}"
                                </p>

                                {/* Client Info */}
                                <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                                    {/* Avatar */}
                                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-lavender/20 shrink-0 bg-lavender/10 flex items-center justify-center" style={{ borderColor: `${styling?.accentColor}30` }}>
                                        {testimonial.avatarUrl ? (
                                            <img
                                                src={testimonial.avatarUrl}
                                                alt={testimonial.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-lavender font-black text-sm" style={{ color: styling?.accentColor }}>
                                                {testimonial.name?.charAt(0) || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-charcoal text-sm">{testimonial.name}</h4>
                                        <p className="text-[10px] uppercase tracking-widest text-charcoal/40 mt-0.5">
                                            {testimonial.location}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* CSS to hide scrollbar explicitly for Webkit */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .hide-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                    `}} />
                </div>
            </div>
        </div>
    );
};
