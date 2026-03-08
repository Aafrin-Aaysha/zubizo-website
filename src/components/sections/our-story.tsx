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

                    {/* Right: Icon Highlights */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        {highlights.map((item: any, idx: number) => {
                            const Icon = typeof item.icon === 'string' ? (Icons as any)[item.icon] : item.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex gap-6 group"
                                >
                                    <div className="shrink-0 w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-lavender group-hover:bg-lavender group-hover:text-white transition-all">
                                        {Icon && <Icon size={24} strokeWidth={1.5} />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-charcoal mb-2 font-serif">
                                            {item.title}
                                        </h3>
                                        <p className="text-charcoal/60 leading-relaxed font-sans font-medium text-sm">
                                            {item.description}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
