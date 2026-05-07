"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
    {
        name: "Ananya & Rohit",
        review: "Zubizo made our wedding invitations truly special. The attention to detail and the quality of materials were beyond our expectations. Every guest appreciated the elegance!",
        location: "Chennai",
    },
    {
        name: "Priya Sharma",
        review: "The customization options were amazing. From design to finish, everything was handled so professionally. Highly recommended for anyone looking for premium invites.",
        location: "Bangalore",
    },
    {
        name: "Ahmed Khan",
        review: "We ordered from abroad, and the entire process was smooth. The team was responsive and the final product was absolutely stunning. Worth every penny!",
        location: "Dubai 🌍",
    },
    {
        name: "Karthik & Meera",
        review: "The designs are unique and classy. What we loved most was how they understood our vision and brought it to life beautifully.",
        location: "Coimbatore",
    },
    {
        name: "Sneha Reddy",
        review: "From the first conversation to delivery, everything was seamless. The quality, finishing, and packaging were top-notch.",
        location: "Hyderabad",
    },
    {
        name: "Rahul Verma",
        review: "Great experience! The team was very patient with all our changes and delivered exactly what we wanted. The invites looked luxurious and premium.",
        location: "Mumbai",
    },
];

export const Testimonials = ({ data, styling, title, subtitle }: any) => {
    // Filter out bad/empty entries from DB; fall back to static list if nothing valid remains
    const dbList = (data?.testimonials || []).filter((t: any) => t?.review && t.review.trim().length > 3);
    const list = dbList.length > 0 ? dbList : testimonials;
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
                backgroundColor: styling?.backgroundColor || '#FAF8F5',
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
                                transition={{ delay: Math.min(idx * 0.1, 0.5) }}
                                className="relative bg-white p-8 flex-none w-[85vw] sm:w-[400px] snap-center rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#ECE7E1]"
                            >
                                {/* Gold Quote Icon */}
                                <div className="text-[40px] font-serif leading-none text-[#D6BFA3]/60 mb-2 select-none">&ldquo;</div>

                                {/* Star Rating */}
                                <div className="flex gap-1 mb-4 mt-0">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} className="fill-[#D6BFA3] text-[#D6BFA3]" />
                                    ))}
                                </div>

                                {/* Review Text */}
                                <p className="text-[#6B6B6B] font-serif leading-[1.8] mb-5 text-[15px] italic min-h-[90px]">
                                    {testimonial.review}
                                </p>

                                {/* Client Info */}
                                <div className="flex items-center gap-3 pt-4 border-t border-[#ECE7E1]">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D6BFA3]/30 shrink-0 bg-[#F0EBF8] flex items-center justify-center">
                                        {testimonial.avatarUrl ? (
                                            <img
                                                src={testimonial.avatarUrl}
                                                alt={testimonial.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-[#6E4B8B] font-black text-sm">
                                                {testimonial.name?.charAt(0) || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1A1A1A] text-sm">{testimonial.name}</h4>
                                        <p className="text-[10px] uppercase tracking-widest text-[#6B6B6B]/60 mt-0.5">
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
