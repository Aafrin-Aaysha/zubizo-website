"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";
import Image from "next/image";
import { Users, Package, Globe2, Palette, Gem } from "lucide-react";

/* ─────────────────────────────────────────────
   Count-up hook
───────────────────────────────────────────── */
function useCountUp(target: number, duration = 2000, started = false) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!started) return;
        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [started, target, duration]);

    return count;
}

/* ─────────────────────────────────────────────
   Metric card
───────────────────────────────────────────── */
interface MetricProps {
    icon: React.ElementType;
    value: number;
    suffix: string;
    label: string;
    sublabel: string;
    color: string;
    bg: string;
    delay: number;
    started: boolean;
}

function MetricCard({
    icon: Icon,
    value,
    suffix,
    label,
    sublabel,
    color,
    bg,
    delay,
    started,
}: MetricProps) {
    const count = useCountUp(value, 1800, started);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="relative group flex flex-col items-center text-center bg-white rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 px-6 py-8"
        >
            {/* Icon */}
            <div
                className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center ${color} mb-5 group-hover:scale-110 transition-transform duration-300`}
            >
                <Icon size={24} />
            </div>

            {/* Number */}
            <div className="flex items-end justify-center gap-0.5 mb-2">
                <span className="text-4xl md:text-5xl font-black text-charcoal font-serif leading-none">
                    {count.toLocaleString()}
                </span>
                <span className={`text-2xl md:text-3xl font-black ${color} leading-none mb-0.5`}>
                    {suffix}
                </span>
            </div>

            {/* Label */}
            <p className="text-sm font-black text-charcoal uppercase tracking-wider mb-1">
                {label}
            </p>
            <p className="text-xs text-neutral-400 font-medium">{sublabel}</p>

            {/* Decorative dot */}
            <span className={`absolute top-5 right-5 w-2 h-2 rounded-full ${bg} ring-2 ${color.replace("text-", "ring-")} opacity-60`} />
        </motion.div>
    );
}

/* ─────────────────────────────────────────────
   Metrics data
───────────────────────────────────────────── */
const metrics: Omit<MetricProps, "started" | "delay">[] = [
    {
        icon: Users,
        value: 3000,
        suffix: "+",
        label: "Happy Clients",
        sublabel: "Families who trusted us",
        color: "text-violet-600",
        bg: "bg-violet-50",
    },
    {
        icon: Package,
        value: 200000,
        suffix: "+",
        label: "Invitations Delivered",
        sublabel: "Orders completed",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        icon: Globe2,
        value: 10,
        suffix: "+",
        label: "Countries Served",
        sublabel: "International orders",
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        icon: Palette,
        value: 300,
        suffix: "+",
        label: "Custom Designs",
        sublabel: "Unique creations crafted",
        color: "text-rose-600",
        bg: "bg-rose-50",
    },
    {
        icon: Gem,
        value: 20,
        suffix: "+",
        label: "Premium Materials",
        sublabel: "Hand-selected finishes",
        color: "text-amber-600",
        bg: "bg-amber-50",
    },
];

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function AboutPage() {
    const metricsRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(metricsRef, { once: true, margin: "-100px" });

    return (
        <main className="min-h-screen bg-white">
            <LuxuryNavbar />

            {/* ── Hero ── */}
            <section className="relative h-[60vh] w-full overflow-hidden pt-28">
                <Image
                    src="https://images.unsplash.com/photo-1512413316925-fd47914c9c11?q=80&w=2000&auto=format&fit=crop"
                    alt="Art and Craft"
                    fill
                    className="object-cover opacity-30"
                    unoptimized
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold text-charcoal sm:text-7xl font-serif"
                    >
                        The Heart of <br />{" "}
                        <span className="text-lavender italic">Zubizo</span>
                    </motion.h1>
                </div>
            </section>

            {/* ── Story ── */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="relative aspect-square overflow-hidden rounded-[3rem] shadow-luxury"
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200"
                            alt="Crafting"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div>
                            <span className="text-lavender font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">
                                OUR LEGACY
                            </span>
                            <h2 className="text-4xl font-bold text-charcoal font-serif">
                                A Legacy of Art
                            </h2>
                            <div className="mt-4 h-1 w-20 bg-lavender/30 rounded-full" />
                        </div>
                        <p className="text-lg text-charcoal/70 leading-relaxed font-sans font-medium">
                            At Zubizo, we believe an invitation is more than just
                            paper—it&apos;s a prelude to a beautiful memory. Our journey
                            began with a simple passion for art and craft, transitioning
                            into a premier destination for luxury stationary.
                        </p>
                        <p className="text-lg text-charcoal/70 leading-relaxed font-sans font-medium">
                            Every stroke of our designs is meticulously crafted to reflect
                            your personal story. We combine traditional techniques with
                            modern aesthetics to produce extraordinary invitation cards
                            that leave a lasting impression.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Zubizo in Numbers ── */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#f9f8ff]">
                <div className="max-w-6xl mx-auto">
                    {/* Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-lavender font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">
                            OUR IMPACT
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black font-serif text-charcoal">
                            Zubizo in Numbers
                        </h2>
                        <p className="mt-4 text-neutral-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                            Every number behind our name represents a family&apos;s trust,
                            a celebration honoured, and a memory made forever.
                        </p>
                        <div className="mt-6 mx-auto h-1 w-16 bg-lavender/30 rounded-full" />
                    </motion.div>

                    {/* Grid — triggers count-up */}
                    <div
                        ref={metricsRef}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                    >
                        {metrics.map((m, i) => (
                            <MetricCard
                                key={m.label}
                                {...m}
                                delay={i * 0.1}
                                started={isInView}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Vision ── */}
            <section className="bg-lavender/5 py-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                    >
                        <span className="text-lavender font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">
                            OUR MISSION
                        </span>
                        <p className="mt-8 text-2xl md:text-4xl text-charcoal font-serif leading-relaxed italic">
                            &quot;To transform moments of celebration into enduring art
                            through premium craftsmanship and visionary design.&quot;
                        </p>
                    </motion.div>
                </div>
            </section>

            <LuxuryFooter />
        </main>
    );
}
