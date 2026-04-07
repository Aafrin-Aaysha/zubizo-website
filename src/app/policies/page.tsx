"use client";

import React from "react";
import { motion } from "framer-motion";
import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";
import {
    CheckCircle2,
    Palette,
    Clock,
    CreditCard,
    XCircle,
    AlertTriangle,
    Truck,
    ShieldAlert,
    FileText,
    MapPin,
    Package,
    RefreshCcw,
    Info,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */

const termsItems = [
    {
        id: "order-confirmation",
        number: "01",
        icon: CheckCircle2,
        title: "Order Confirmation",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        badge: "bg-emerald-100 text-emerald-700",
        points: [
            "Orders are confirmed only after receiving the initial advance payment.",
            "No work will begin without payment confirmation.",
        ],
    },
    {
        id: "design-process",
        number: "02",
        icon: Palette,
        title: "Design Process & Approval",
        color: "text-violet-600",
        bg: "bg-violet-50",
        border: "border-violet-100",
        badge: "bg-violet-100 text-violet-700",
        points: [
            "A digital design proof will be shared for your review.",
            "Clients must check all details carefully (names, dates, content, etc.).",
            "Once approved, the design is final.",
            "Any changes after approval will be charged additionally.",
        ],
        highlight:
            "Once you approve the design, no free changes will be made.",
    },
    {
        id: "production-timeline",
        number: "03",
        icon: Clock,
        title: "Production Timeline",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        badge: "bg-amber-100 text-amber-700",
        points: [
            "Production starts after final design approval.",
            "Standard timeline: 7–10 working days.",
            "Sundays & public holidays are not included.",
            "Urgent orders may be accepted with extra charges (based on availability).",
        ],
    },
    {
        id: "payment-policy",
        number: "04",
        icon: CreditCard,
        title: "Payment Policy",
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
        badge: "bg-blue-100 text-blue-700",
        points: [
            "50% advance is required to begin the order.",
            "Remaining balance must be paid before dispatch.",
            "Orders will not be released without full payment.",
        ],
        highlight: "Full payment is required before your order is dispatched.",
    },
    {
        id: "cancellation",
        number: "05",
        icon: XCircle,
        title: "Cancellation & Refund",
        color: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-100",
        badge: "bg-rose-100 text-rose-700",
        points: [
            "Advance payment is non-refundable once design work has started.",
            "Orders cannot be cancelled after production begins.",
        ],
    },
    {
        id: "color-material",
        number: "06",
        icon: AlertTriangle,
        title: "Color & Material Disclaimer",
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-100",
        badge: "bg-orange-100 text-orange-700",
        points: [
            "Slight variations in color, print, or material may occur due to screen settings and production process.",
            "These are not considered defects.",
        ],
    },
    {
        id: "delivery-policy",
        number: "07",
        icon: Truck,
        title: "Delivery Policy",
        color: "text-teal-600",
        bg: "bg-teal-50",
        border: "border-teal-100",
        badge: "bg-teal-100 text-teal-700",
        points: [
            "Delivery timelines depend on courier services.",
            "We are not responsible for delays, damage, or loss during transit.",
            "Customers must provide accurate shipping details.",
        ],
    },
    {
        id: "responsibility",
        number: "08",
        icon: ShieldAlert,
        title: "Responsibility",
        color: "text-slate-600",
        bg: "bg-slate-50",
        border: "border-slate-100",
        badge: "bg-slate-100 text-slate-700",
        points: [
            "We are not responsible for errors approved in the final design.",
            "Please ensure all details are correct before approval.",
        ],
    },
];

const shippingItems = [
    {
        icon: Clock,
        title: "Delivery Time",
        color: "text-teal-600",
        bg: "bg-teal-50",
        points: [
            "Orders within Tamil Nadu will be delivered in 2–3 working days.",
            "Orders to other states will be delivered in 3–7 working days, depending on the location.",
        ],
    },
    {
        icon: CreditCard,
        title: "Shipping Charges",
        color: "text-blue-600",
        bg: "bg-blue-50",
        points: [
            "Shipping charges are applicable and vary based on location and order size.",
            "Final charges will be informed before dispatch.",
        ],
    },
    {
        icon: Package,
        title: "Tracking",
        color: "text-violet-600",
        bg: "bg-violet-50",
        points: [
            "Tracking details will be shared once the order is dispatched so you can monitor your delivery.",
        ],
    },
    {
        icon: AlertTriangle,
        title: "Delays",
        color: "text-amber-600",
        bg: "bg-amber-50",
        points: [
            "Delivery timelines may be affected due to courier delays, weather conditions, or other unforeseen circumstances.",
            "We are not responsible for such delays.",
        ],
    },
    {
        icon: ShieldAlert,
        title: "Damage or Loss",
        color: "text-rose-600",
        bg: "bg-rose-50",
        points: [
            "We are not responsible for any damage or loss during transit handled by courier services.",
            "However, we will assist you in resolving the issue wherever possible.",
        ],
    },
    {
        icon: MapPin,
        title: "Address Accuracy",
        color: "text-orange-600",
        bg: "bg-orange-50",
        points: [
            "Customers must provide complete and accurate shipping details.",
            "We are not responsible for delivery issues caused due to incorrect address information.",
        ],
    },
];

const refundPoints = [
    "Advance payment is non-refundable once the design process has started.",
    "No refunds will be provided after final design approval.",
    "Orders cannot be refunded once production has begun.",
];

/* ─────────────────────────────────────────────
   Animation variants
───────────────────────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, delay: i * 0.07 },
    }),
};

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function SectionHeading({
    icon: Icon,
    title,
    subtitle,
    iconCls,
    iconBg,
}: {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    iconCls: string;
    iconBg: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-10"
        >
            <div
                className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center ${iconCls} border border-white shadow-sm shrink-0`}
            >
                <Icon size={22} />
            </div>
            <div>
                <h2 className="text-3xl font-black font-serif text-charcoal">{title}</h2>
                <p className="text-xs text-neutral-400 font-semibold uppercase tracking-widest mt-0.5">
                    {subtitle}
                </p>
            </div>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function PoliciesPage() {
    return (
        <main className="min-h-screen bg-[#f9f9fb]">
            <LuxuryNavbar />

            {/* ── Hero ── */}
            <section className="pt-40 pb-20 bg-white border-b border-charcoal/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <span className="text-lavender font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">
                            LEGAL &amp; TRUST
                        </span>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-charcoal font-serif mb-6 italic">
                            Our Policies
                        </h1>
                        <p className="text-neutral-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                            Transparency and trust at the heart of Zubizo. Please read
                            these policies carefully before placing your order.
                        </p>
                    </motion.div>

                    {/* Quick-jump chips */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="flex flex-wrap justify-center gap-3 mt-10"
                    >
                        {[
                            { label: "Terms & Conditions", href: "#terms" },
                            { label: "Shipping Policy", href: "#shipping" },
                            { label: "Refund Policy", href: "#refund" },
                        ].map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full border border-neutral-200 text-neutral-500 hover:border-lavender hover:text-lavender bg-white transition-all"
                            >
                                {item.label}
                            </a>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Content ── */}
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 space-y-28">

                {/* ════════ Terms & Conditions ════════ */}
                <section id="terms">
                    <SectionHeading
                        icon={FileText}
                        title="Terms & Conditions"
                        subtitle="Governing your orders with Zubizo"
                        iconCls="text-lavender"
                        iconBg="bg-lavender/10"
                    />

                    <div className="space-y-4">
                        {termsItems.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={item.id}
                                    custom={i}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeUp}
                                    className={`bg-white rounded-3xl border ${item.border} shadow-sm overflow-hidden`}
                                >
                                    <div className="p-6 md:p-8">
                                        {/* Card header */}
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`w-11 h-11 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} shrink-0`}
                                            >
                                                <Icon size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full ${item.badge}`}>
                                                        {item.number}
                                                    </span>
                                                    <h3 className="text-base font-black text-charcoal uppercase tracking-wide">
                                                        {item.title}
                                                    </h3>
                                                </div>

                                                {/* Points */}
                                                <ul className="space-y-2.5">
                                                    {item.points.map((point, j) => (
                                                        <li
                                                            key={j}
                                                            className="flex items-start gap-3 text-sm text-neutral-600 leading-relaxed"
                                                        >
                                                            <span className={`mt-2 w-1.5 h-1.5 rounded-full ${item.bg} ring-1 ring-offset-1 ${item.color.replace("text-", "ring-")} shrink-0`} />
                                                            {point}
                                                        </li>
                                                    ))}
                                                </ul>

                                                {/* Optional highlight banner */}
                                                {item.highlight && (
                                                    <div className={`mt-4 flex items-start gap-2 ${item.bg} rounded-2xl px-4 py-3`}>
                                                        <Info size={14} className={`${item.color} shrink-0 mt-0.5`} />
                                                        <p className={`text-xs font-semibold ${item.color}`}>
                                                            {item.highlight}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* ════════ Shipping Policy ════════ */}
                <section id="shipping">
                    <SectionHeading
                        icon={Truck}
                        title="Shipping Policy"
                        subtitle="Delivery timelines & logistics"
                        iconCls="text-teal-600"
                        iconBg="bg-teal-50"
                    />

                    <div className="grid sm:grid-cols-2 gap-4">
                        {shippingItems.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={i}
                                    custom={i}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeUp}
                                    className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} mb-4`}>
                                        <Icon size={18} />
                                    </div>
                                    <h3 className="text-sm font-black text-charcoal uppercase tracking-wide mb-3">
                                        {item.title}
                                    </h3>
                                    <ul className="space-y-2">
                                        {item.points.map((point, j) => (
                                            <li
                                                key={j}
                                                className="flex items-start gap-2.5 text-sm text-neutral-600 leading-relaxed"
                                            >
                                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-neutral-300 shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* ════════ Refund Policy ════════ */}
                <section id="refund">
                    <SectionHeading
                        icon={RefreshCcw}
                        title="Refund Policy"
                        subtitle="Cancellations & returns"
                        iconCls="text-rose-600"
                        iconBg="bg-rose-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 md:p-8"
                    >
                        <ul className="space-y-4">
                            {refundPoints.map((point, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-4"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-xs font-black text-rose-500">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-700 leading-relaxed pt-1">
                                        {point}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Warning banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 }}
                        className="mt-5 bg-amber-50 border border-amber-100 rounded-3xl p-5 flex items-start gap-4"
                    >
                        <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800 leading-relaxed">
                            <strong>Important:</strong> Once a design is approved and production
                            has begun, no cancellations or refunds are possible. Please review
                            all details thoroughly before giving your approval.
                        </p>
                    </motion.div>
                </section>

                {/* ── Footer note ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="border-t border-neutral-100 pt-12 text-center"
                >
                    <p className="text-sm text-neutral-400 leading-relaxed max-w-lg mx-auto">
                        Have questions about any of these policies? Reach out to us before
                        placing your order — we&apos;re happy to clarify anything.
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-lavender hover:underline underline-offset-4 transition-all"
                    >
                        Contact us →
                    </a>
                </motion.div>
            </div>

            <LuxuryFooter />
        </main>
    );
}
