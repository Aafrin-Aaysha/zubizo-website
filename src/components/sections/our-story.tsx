"use client";

import * as React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
const { Feather, Scroll, Sparkles, Heart } = Icons;

const storyHighlights = [
    {
        icon: Feather,
        title: "Craftsmanship",
        description: "We design with attention to detail and artistic precision.",
    },
    {
        icon: Scroll,
        title: "Personalization",
        description: "Every invitation reflects your story uniquely.",
    },
    {
        icon: Sparkles,
        title: "Luxury Experience",
        description: "Premium materials and finishes for timeless elegance.",
    },
    {
        icon: Heart,
        title: "Client-Centered Approach",
        description: "We work closely with clients to create memorable first impressions.",
    },
];

const storyParagraphs = [
    { text: "At <span class='font-bold text-charcoal'>Zubizo</span>, we believe that every celebration deserves an invitation as unique and beautiful as the occasion itself.", isHtml: true },
    { text: "Founded with a passion for <span class='font-bold text-charcoal'>artistry and detail</span>, we craft luxury invitation stationery that tells your story with elegance and sophistication.", isHtml: true },
    { text: "From <span class='font-bold text-charcoal'>handpicked materials</span> to <span class='font-bold text-charcoal'>bespoke designs</span>, every piece from our studio is created with love, precision, and a commitment to excellence.", isHtml: true },
    { text: "We don't just create invitations — we create <span class='font-bold text-lavender'>timeless memories</span> that set the perfect tone for life's most beautiful moments.", isHtml: true }
];

export const OurStory = ({ data, styling, title, subtitle, siteSettings }: any) => {
    const highlights = data?.highlights || storyHighlights;

    // If we have siteSettings.about, use it as the first paragraph if data.paragraphs is empty
    const paragraphs = (data?.paragraphs && data.paragraphs.length > 0) ? data.paragraphs : (
        siteSettings?.about ? [
            { text: siteSettings.about, isHtml: false },
            ...storyParagraphs.slice(1)
        ] : storyParagraphs
    );

    return (
        <section
            id="about"
            className="py-16 md:py-20"
            style={{
                backgroundColor: styling?.backgroundColor || 'var(--color-pearl-white)',
                padding: styling?.padding || '80px 0'
            }}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span
                        className="font-sans text-[12px] font-semibold uppercase tracking-widest text-lavender mb-4 block"
                        style={{ color: styling?.accentColor }}
                    >
                        {subtitle || "ABOUT ZUBIZO"}
                    </span>
                    <h2
                        className="text-[36px] font-medium text-charcoal font-serif"
                        style={{ color: styling?.textColor }}
                    >
                        {title || "Our Story"}
                    </h2>
                </motion.div>

                {/* Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Story Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        {paragraphs.map((p: any, idx: number) => (
                            p.isHtml ? (
                                <p
                                    key={idx}
                                    className="text-lg text-charcoal/70 font-medium leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: p.text }}
                                />
                            ) : (
                                <p key={idx} className="text-lg text-gray-600 leading-relaxed">
                                    {p.text}
                                </p>
                            )
                        ))}
                    </motion.div>

                    {/* Right: Brand Image / Logo */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center items-center lg:justify-end h-full w-full relative"
                    >
                        <div className="relative w-full max-w-[450px] aspect-square flex items-center justify-center p-12 bg-white/40 rounded-[3rem] border border-[#ae7fcb]/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-15px_rgba(174,127,203,0.15)] transition-all duration-700 group hover:-translate-y-2">
                            {/* Decorative Background Elements */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#ae7fcb]/5 to-transparent rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#ae7fcb]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />
                            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#ae7fcb]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />

                            {/* Logo Image */}
                            <img
                                src={data?.imageUrl || siteSettings?.aboutImageUrl || siteSettings?.logoUrl || '/brand.PNG'}
                                alt="Zubizo Brand Logo"
                                className="w-[85%] h-[85%] object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-700 ease-out relative z-10"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
