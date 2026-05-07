"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BookOpen, MessageCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

const steps = [
    {
        step: "01",
        icon: BookOpen,
        title: "Explore Catalogue",
        description: "Browse our curated collection of premium handcrafted designs and find the one that resonates with your vision.",
        href: "/catalog",
        cta: "Browse Designs",
    },
    {
        step: "02",
        icon: MessageCircle,
        title: "Order via WhatsApp",
        description: "Reach out to us directly on WhatsApp with your chosen design. We'll guide you through personalisation options.",
        href: "https://wa.me/918124548133",
        cta: "Chat with Us",
        external: true,
    },
    {
        step: "03",
        icon: CheckCircle,
        title: "Confirm & Payment",
        description: "Make a 50% advance payment to get started. Once confirmed, our team begins crafting your personalised design.",
        href: "/catalog",
        cta: "Get Started",
    },
];

export const WorkflowProcess = () => {
    return (
        <section className="relative w-full bg-[#FAF8F5] border-t border-[#ECE7E1]" style={{ padding: 'var(--section-spacing) 0' }}>
            <div className="site-container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D6BFA3] mb-4 block">
                        HOW IT WORKS
                    </span>
                    <h2 className="text-[30px] md:text-[36px] font-medium text-[#1A1A1A] font-serif">
                        Simple. Elegant. Personal.
                    </h2>
                </motion.div>

                {/* Steps */}
                <div className="relative">
                    {/* Connecting line — desktop only */}
                    <div className="hidden lg:block absolute top-[36px] left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-[1px] bg-gradient-to-r from-transparent via-[#D6BFA3]/50 to-transparent" />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={step.step}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: idx * 0.15 }}
                                    className="flex flex-col items-center lg:items-center text-center"
                                >
                                    {/* Icon Circle */}
                                    <div className="relative mb-6 flex-shrink-0">
                                        <div className="w-[72px] h-[72px] rounded-full bg-[#F0EBF8] flex items-center justify-center transition-transform duration-300 hover:scale-110 shadow-[0_4px_16px_rgba(198,177,225,0.15)]">
                                            <Icon size={26} strokeWidth={1.4} className="text-[#6E4B8B]" />
                                        </div>
                                        {/* Step number badge */}
                                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D6BFA3] flex items-center justify-center text-[9px] font-black text-white">
                                            {idx + 1}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-[18px] font-semibold font-serif text-[#1A1A1A] mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-[#6B6B6B] leading-[1.75] max-w-[260px] mb-5">
                                        {step.description}
                                    </p>
                                    <Link
                                        href={step.href}
                                        target={step.external ? "_blank" : undefined}
                                        rel={step.external ? "noopener noreferrer" : undefined}
                                        className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#6E4B8B] hover:text-[#D6BFA3] transition-colors border-b border-[#6E4B8B]/30 hover:border-[#D6BFA3] pb-0.5"
                                    >
                                        {step.cta}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
