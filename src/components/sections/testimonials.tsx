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
        <section
            id="testimonials"
            className="py-[120px] bg-white relative overflow-hidden"
            style={{
                backgroundColor: styling?.backgroundColor || '#ffffff',
                padding: styling?.padding || '120px 0'
            }}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
                >
                    <div>
                        <span
                            className="text-lavender font-bold uppercase tracking-[0.4em] text-[10px] mb-6 block"
                            style={{ color: styling?.accentColor }}
                        >
                            {subtitle || "Client Love"}
                        </span>
                        <h2
                            className="text-4xl md:text-5xl font-bold text-charcoal font-serif"
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
                                className="p-4 rounded-full border border-gray-200 hover:border-[#ae7fcb] hover:bg-[#ae7fcb] hover:text-white transition-all text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ae7fcb]/50 group"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft size={24} className="group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="p-4 rounded-full border border-gray-200 hover:border-[#ae7fcb] hover:bg-[#ae7fcb] hover:text-white transition-all text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ae7fcb]/50 group"
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
                                className="relative bg-white rounded-3xl p-8 shadow-premium hover:shadow-luxury transition-all border border-gray-50 flex-none w-[85vw] sm:w-[400px] snap-center"
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
                                <p className="text-gray-600 leading-relaxed mb-6 text-sm italic min-h-[100px]">
                                    "{testimonial.review}"
                                </p>

                                {/* Client Info */}
                                <div className="border-t border-gray-100 pt-4">
                                    <h4 className="font-bold text-charcoal text-sm">{testimonial.name}</h4>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                                        {testimonial.location}
                                    </p>
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
        </section>
    );
};
