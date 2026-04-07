"use client";

import * as React from "react";
import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";
import { motion } from "framer-motion";
import {
    FileText,
    Truck,
    RefreshCcw,
    CheckCircle,
    Palette,
    Clock,
    CreditCard,
    XCircle,
    AlertTriangle,
    Users,
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.08 },
    }),
};

interface PolicyItem {
    title: string;
    points: string[];
}

interface PolicySection {
    id: string;
    icon: React.ElementType;
    label: string;
    heading: string;
    color: string;
    bgColor: string;
    items: PolicyItem[];
}

const termsData: PolicySection[] = [
    {
        id: "order-confirmation",
        icon: CheckCircle,
        label: "1. Order Confirmation",
        heading: "Order Confirmation",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        items: [
            {
                title: "",
                points: [
                    "Orders are confirmed only after receiving the initial advance payment.",
                    "No work will begin without payment confirmation.",
                ],
            },
        ],
    },
    {
        id: "design-process",
        icon: Palette,
        label: "2. Design Process & Approval",
        heading: "Design Process & Approval",
        color: "text-violet-600",
        bgColor: "bg-violet-50",
        items: [
            {
                title: "",
                points: [
                    "A digital design proof will be shared for your review.",
                    "Clients must check all details carefully (names, dates, content, etc.).",
                    "Once approved, the design is final.",
                    "Any changes after approval will be charged additionally.",
                ],
            },
        ],
    },
    {
        id: "production-timeline",
        icon: Clock,
        label: "3. Production Timeline",
        heading: "Production Timeline",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        items: [
            {
                title: "",
                points: [
                    "Production starts after final design approval.",
                    "Standard timeline: 7–10 working days.",
                    "Sundays & public holidays are not included.",
                    "Urgent orders may be accepted with extra charges (based on availability).",
                ],
            },
        ],
    },
    {
        id: "payment-policy",
        icon: CreditCard,
        label: "4. Payment Policy",
        heading: "Payment Policy",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        items: [
            {
                title: "",
                points: [
                    "50% advance is required to begin the order.",
                    "Remaining balance must be paid before dispatch.",
                    "Orders will not be released without full payment.",
                ],
            },
        ],
    },
    {
        id: "cancellation-refund",
        icon: XCircle,
        label: "5. Cancellation & Refund",
        heading: "Cancellation & Refund",
        color: "text-rose-600",
        bgColor: "bg-rose-50",
        items: [
            {
                title: "",
                points: [
                    "Advance payment is non-refundable once design work has started.",
                    "Orders cannot be cancelled after production begins.",
                ],
            },
        ],
    },
    {
        id: "color-material",
        icon: AlertTriangle,
        label: "6. Color & Material Disclaimer",
        heading: "Color & Material Disclaimer",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        items: [
            {
                title: "",
                points: [
                    "Slight variations in color, print, or material may occur due to screen settings and production process.",
                    "These are not considered defects.",
                ],
            },
        ],
    },
    {
        id: "delivery-policy",
        icon: Truck,
        label: "7. Delivery Policy",
        heading: "Delivery Policy",
        color: "text-teal-600",
        bgColor: "bg-teal-50",
        items: [
            {
                title: "",
                points: [
                    "Delivery timelines depend on courier services.",
                    "We are not responsible for delays, damage, or loss during transit.",
                    "Customers must provide accurate shipping details.",
                ],
            },
        ],
    },
    {
        id: "responsibility",
        icon: Users,
        label: "8. Responsibility",
        heading: "Responsibility",
        color: "text-slate-600",
        bgColor: "bg-slate-50",
        items: [
            {
                title: "",
                points: [
                    "We are not responsible for errors approved in the final design.",
                    "Please ensure all details are correct before approval.",
                ],
            },
        ],
    },
];

const shippingData: PolicyItem[] = [
    {
        title: "1. Delivery Time",
        points: [
            "Orders within Tamil Nadu will be delivered in 2–3 working days.",
            "Orders to other states will be delivered in 3–7 working days, depending on the location.",
        ],
    },
    {
        title: "2. Shipping Charges",
        points: [
            "Shipping charges are applicable and vary based on location and order size.",
            "Final charges will be informed before dispatch.",
        ],
    },
    {
        title: "3. Tracking",
        points: [
            "Tracking details will be shared once the order is dispatched so you can monitor your delivery.",
        ],
    },
    {
        title: "4. Delays",
        points: [
            "Delivery timelines may be affected due to courier delays, weather conditions, or other unforeseen circumstances.",
            "We are not responsible for such delays.",
        ],
    },
    {
        title: "5. Damage or Loss",
        points: [
            "We are not responsible for any damage or loss during transit handled by courier services.",
            "However, we will assist you in resolving the issue wherever possible.",
        ],
    },
    {
        title: "6. Address Accuracy",
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

function SectionNav({ sections }: { sections: PolicySection[] }) {
    return (
        <nav className="hidden lg:flex flex-col gap-1 sticky top-32 self-start w-56 shrink-0">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3 px-3">
                On this page
            </p>
            {[
                { id: "terms", label: "Terms & Conditions" },
                { id: "shipping", label: "Shipping Policy" },
                { id: "refund", label: "Refund Policy" },
            ].map((item) => (
                <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="text-sm text-neutral-500 hover:text-charcoal font-medium px-3 py-2 rounded-xl hover:bg-neutral-50 transition-all"
                >
                    {item.label}
                </a>
            ))}
        </nav>
    );
}

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#fafafa]">
            <LuxuryNavbar />

            {/* Hero */}
            <section className="pt-40 pb-20 bg-white border-b border-charcoal/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <span className="inline-flex items-center gap-2 text-lavender font-black uppercase tracking-[0.4em] text-[10px] mb-5">
                            <FileText size={12} />
                            Legal &amp; Compliance
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black font-serif text-charcoal mb-6 tracking-tight">
                            Terms &amp; Conditions
                        </h1>
                        <p className="text-neutral-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                            Please read these policies carefully before placing
                            your order with Zubizo. By proceeding, you agree to
                            the terms outlined below.
                        </p>
                        <p className="mt-4 text-xs text-neutral-400 font-medium">
                            Effective from the date of your order
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Body */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 flex gap-16 items-start">
                {/* Sidebar nav */}
                <SectionNav sections={termsData} />

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-24">
                    {/* ── Terms & Conditions ── */}
                    <section id="terms">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-4 mb-12"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-lavender/10 flex items-center justify-center text-lavender border border-lavender/20">
                                <FileText size={22} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black font-serif text-charcoal">
                                    Terms &amp; Conditions
                                </h2>
                                <p className="text-xs text-neutral-400 font-medium mt-0.5 uppercase tracking-wider">
                                    Governing your orders with Zubizo
                                </p>
                            </div>
                        </motion.div>

                        <div className="grid gap-5">
                            {termsData.map((section, i) => {
                                const Icon = section.icon;
                                return (
                                    <motion.div
                                        key={section.id}
                                        custom={i}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        variants={fadeUp}
                                        className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden"
                                    >
                                        <div className="p-6 md:p-8">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={`w-10 h-10 rounded-xl ${section.bgColor} flex items-center justify-center shrink-0 mt-0.5`}
                                                >
                                                    <Icon
                                                        size={18}
                                                        className={section.color}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-base font-black text-charcoal mb-3 uppercase tracking-wide">
                                                        {section.heading}
                                                    </h3>
                                                    <ul className="space-y-2">
                                                        {section.items[0].points.map(
                                                            (point, j) => (
                                                                <li
                                                                    key={j}
                                                                    className="flex items-start gap-3 text-sm text-neutral-600 leading-relaxed"
                                                                >
                                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-neutral-300 shrink-0" />
                                                                    {point}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>

                    {/* ── Shipping Policy ── */}
                    <section id="shipping">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-4 mb-12"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                                <Truck size={22} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black font-serif text-charcoal">
                                    Shipping Policy
                                </h2>
                                <p className="text-xs text-neutral-400 font-medium mt-0.5 uppercase tracking-wider">
                                    Delivery timelines &amp; logistics
                                </p>
                            </div>
                        </motion.div>

                        <div className="grid gap-5">
                            {shippingData.map((item, i) => (
                                <motion.div
                                    key={i}
                                    custom={i}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeUp}
                                    className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden"
                                >
                                    <div className="p-6 md:p-8">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                                                <span className="text-xs font-black text-teal-600">
                                                    {i + 1}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base font-black text-charcoal mb-3 uppercase tracking-wide">
                                                    {item.title.replace(
                                                        /^\d+\.\s/,
                                                        ""
                                                    )}
                                                </h3>
                                                <ul className="space-y-2">
                                                    {item.points.map(
                                                        (point, j) => (
                                                            <li
                                                                key={j}
                                                                className="flex items-start gap-3 text-sm text-neutral-600 leading-relaxed"
                                                            >
                                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-neutral-300 shrink-0" />
                                                                {point}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* ── Refund Policy ── */}
                    <section id="refund">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-4 mb-12"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                                <RefreshCcw size={22} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black font-serif text-charcoal">
                                    Refund Policy
                                </h2>
                                <p className="text-xs text-neutral-400 font-medium mt-0.5 uppercase tracking-wider">
                                    Cancellations &amp; returns
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden"
                        >
                            <div className="p-6 md:p-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
                                        <RefreshCcw
                                            size={18}
                                            className="text-rose-500"
                                        />
                                    </div>
                                    <ul className="flex-1 space-y-3">
                                        {refundPoints.map((point, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-3 text-sm text-neutral-600 leading-relaxed"
                                            >
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-300 shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>

                        {/* Notice banner */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="mt-6 bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-start gap-4"
                        >
                            <AlertTriangle
                                size={20}
                                className="text-amber-500 shrink-0 mt-0.5"
                            />
                            <p className="text-sm text-amber-800 leading-relaxed">
                                <strong>Important:</strong> Once a design is
                                approved and production has begun, no
                                cancellations or refunds are possible. Please
                                review all details thoroughly before giving your
                                approval.
                            </p>
                        </motion.div>
                    </section>

                    {/* Footer note */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="border-t border-neutral-100 pt-12 text-center"
                    >
                        <p className="text-sm text-neutral-400 leading-relaxed max-w-lg mx-auto">
                            If you have any questions about these policies,
                            please reach out to us before placing your order.
                            We&apos;re happy to clarify anything.
                        </p>
                        <a
                            href="/contact"
                            className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-lavender hover:underline underline-offset-4"
                        >
                            Contact us →
                        </a>
                    </motion.div>
                </div>
            </div>

            <LuxuryFooter />
        </main>
    );
}
