"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import * as Icons from "lucide-react";
const { Feather, Scroll, Sparkles, Heart, Users, Package, Globe2, Palette, Gem } = Icons;

/* ─────────────────────────────────────────────
   Count-up hook
───────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800, started = false) {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        if (!started) return;
        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [started, target, duration]);

    return count;
}

/* ─────────────────────────────────────────────
   Individual metric card
───────────────────────────────────────────── */
interface MetricCardProps {
    icon: React.ElementType;
    value: number;
    suffix: string;
    label: string;
    sublabel: string;
    color: string;
    bg: string;
    index: number;
    started: boolean;
}

function MetricCard({ icon: Icon, value, suffix, label, sublabel, color, bg, index, started }: MetricCardProps) {
    const count = useCountUp(value, 1800, started);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: index * 0.09 }}
            className="group flex flex-col items-center text-center bg-white rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 px-5 py-7"
        >
            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center ${color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={22} />
            </div>
            <div className="flex items-end justify-center gap-0.5 mb-1.5">
                <span className="text-3xl md:text-4xl font-black text-charcoal font-serif leading-none">
                    {count >= 1000 ? count.toLocaleString("en-IN") : count}
                </span>
                <span className={`text-xl md:text-2xl font-black ${color} leading-none mb-0.5`}>{suffix}</span>
            </div>
            <p className="text-xs font-black text-charcoal uppercase tracking-wider mb-1">{label}</p>
            <p className="text-[11px] text-neutral-400 font-medium leading-tight">{sublabel}</p>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────
   Metrics data
───────────────────────────────────────────── */
const metricsData = [
    { icon: Users,   value: 1000,   suffix: "+", label: "Happy Clients",          sublabel: "Families who trusted us",    color: "text-violet-600", bg: "bg-violet-50"  },
    { icon: Package, value: 100000, suffix: "+", label: "Invitations Delivered",  sublabel: "Orders completed",           color: "text-emerald-600", bg: "bg-emerald-50"},
    { icon: Globe2,  value: 15,     suffix: "+", label: "Countries Served",       sublabel: "International orders",       color: "text-blue-600",    bg: "bg-blue-50"   },
    { icon: Palette, value: 300,    suffix: "+", label: "Custom Designs",         sublabel: "Unique creations crafted",   color: "text-rose-600",    bg: "bg-rose-50"   },
    { icon: Gem,     value: 20,     suffix: "+", label: "Premium Materials",      sublabel: "Hand-selected finishes",     color: "text-amber-600",   bg: "bg-amber-50"  },
];

/* ─────────────────────────────────────────────
   Story section data
───────────────────────────────────────────── */
const storyHighlights = [
    { icon: Feather,  title: "Craftsmanship",          description: "We design with attention to detail and artistic precision."         },
    { icon: Scroll,   title: "Personalization",         description: "Every invitation reflects your story uniquely."                     },
    { icon: Sparkles, title: "Luxury Experience",       description: "Premium materials and finishes for timeless elegance."              },
    { icon: Heart,    title: "Client-Centered Approach",description: "We work closely with clients to create memorable first impressions."},
];

const storyParagraphs = [
    { text: "At <span class='font-bold text-charcoal'>Zubizo</span>, we believe that every celebration deserves an invitation as unique and beautiful as the occasion itself.", isHtml: true },
    { text: "Founded with a passion for <span class='font-bold text-charcoal'>artistry and detail</span>, we craft luxury invitation stationery that tells your story with elegance and sophistication.", isHtml: true },
    { text: "From <span class='font-bold text-charcoal'>handpicked materials</span> to <span class='font-bold text-charcoal'>bespoke designs</span>, every piece from our studio is created with love, precision, and a commitment to excellence.", isHtml: true },
    { text: "We don't just create invitations — we create <span class='font-bold text-lavender'>timeless memories</span> that set the perfect tone for life's most beautiful moments.", isHtml: true }
];

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export const OurStory = ({ data, styling, title, subtitle, siteSettings }: any) => {
    const highlights = data?.highlights || storyHighlights;
    const paragraphs = (data?.paragraphs && data.paragraphs.length > 0) ? data.paragraphs : (
        siteSettings?.about ? [
            { text: siteSettings.about, isHtml: false },
            ...storyParagraphs.slice(1)
        ] : storyParagraphs
    );

    // Trigger count-up when metrics row scrolls into view
    const metricsRef = React.useRef<HTMLDivElement>(null);
    const isInView = useInView(metricsRef, { once: true, margin: "-80px" });

    return (
        <div
            id="about"
            style={{ backgroundColor: styling?.backgroundColor || 'transparent' }}
        >
            <div className="w-full">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
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
                            <div className="absolute inset-0 bg-gradient-to-br from-[#ae7fcb]/5 to-transparent rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#ae7fcb]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />
                            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#ae7fcb]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />
                            <img
                                src={data?.imageUrl || siteSettings?.aboutImageUrl || siteSettings?.logoUrl || '/brand.png'}
                                alt="Zubizo Brand Logo"
                                className="w-[85%] h-[85%] object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-700 ease-out relative z-10"
                            />
                        </div>
                    </motion.div>
                </div>

                {/* ─── Zubizo in Numbers ─── */}
                <div className="mt-20">
                    {/* Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <span className="font-sans text-[11px] font-black uppercase tracking-[0.35em] text-lavender mb-3 block">
                            OUR IMPACT
                        </span>
                        <h3 className="text-2xl md:text-3xl font-black font-serif text-charcoal">
                            Zubizo in Numbers
                        </h3>
                        <p className="mt-2 text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                            Every number represents a family&apos;s trust, a celebration honoured, and a memory made forever.
                        </p>
                        <div className="mt-4 mx-auto h-0.5 w-12 bg-lavender/30 rounded-full" />
                    </motion.div>

                    {/* Metrics grid */}
                    <div
                        ref={metricsRef}
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
                    >
                        {metricsData.map((m, i) => (
                            <MetricCard
                                key={m.label}
                                {...m}
                                index={i}
                                started={isInView}
                            />
                        ))}
                    </div>
                </div>
                {/* ─── End Zubizo in Numbers ─── */}
            </div>
        </div>
    );
};
