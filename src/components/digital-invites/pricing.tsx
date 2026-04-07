"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const pricingData = {
  invites: [
    {
      name: "Image Invite",
      price: "499",
      description: "Perfect for quick and elegant announcements.",
      features: [
        "HD PNG / JPEG / PDF",
        "WhatsApp & Social Ready",
        "Premium Artisanal Design",
        "Personalized Content"
      ],
      cta: "Choose Image Invite",
      href: "/digital-invites/image",
      isRecommended: false
    },
    {
      name: "Video Invite",
      price: "1499",
      description: "Cinematic reveal with custom animation.",
      features: [
        "Full HD MP4 Format",
        "Custom Background Music",
        "Instagram Reel Ready",
        "Custom Couple Names"
      ],
      cta: "Choose Video Invite",
      href: "/digital-invites/video",
      isRecommended: false
    }
  ],
  websites: [
    {
      name: "Starter",
      price: "2999",
      description: "Perfect for simple and elegant invites",
      features: [
        "4 Website Sections (Blocks)",
        "Basic Design Layout",
        "Event Details Page",
        "Mobile Friendly Design"
      ],
      cta: "Create Starter",
      href: "/digital-invites/website",
      isRecommended: false
    },
    {
      name: "Value",
      price: "3999",
      description: "A more engaging experience with added personalization",
      features: [
        "Custom Design Styling",
        "Event Timeline Section",
        "Background Music",
        "Mobile Optimized"
      ],
      cta: "Create Value",
      href: "/digital-invites/website",
      isRecommended: true
    },
    {
      name: "Premium",
      price: "4999",
      description: "Ideal for detailed and interactive invites",
      features: [
        "Fully Custom Design",
        "Event Timeline & Story Section",
        "RSVP System (Guest Response)",
        "Google Maps Integration"
      ],
      cta: "Create Premium",
      href: "/digital-invites/website",
      isRecommended: false
    },
    {
      name: "Ultimate",
      price: "6999",
      description: "Complete experience with all essential features",
      features: [
        "Advanced Custom Design",
        "RSVP System",
        "Photo Gallery + Video Support",
        "Guest Message Section",
        "Google Maps Integration"
      ],
      cta: "Create Ultimate",
      href: "/digital-invites/website",
      isRecommended: false
    }
  ]
};

export const PricingSection = () => {
    const [activeCategory, setActiveCategory] = useState<'invites' | 'websites'>('websites');
    const plans = pricingData[activeCategory];

    return (
        <section id="pricing" className="py-32 bg-white">
            <div className="site-container">
                <div className="text-center mb-16 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">Timeless Value</h2>
                        <p className="text-charcoal/50 font-medium max-w-xl mx-auto mb-12">
                            Luxury digital experiences designed to fit every celebration.
                        </p>

                        {/* Tab Switcher */}
                        <div className="inline-flex p-1.5 bg-gray-50 rounded-2xl border border-charcoal/5 mb-8">
                            <button
                                onClick={() => setActiveCategory('invites')}
                                className={cn(
                                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                    activeCategory === 'invites' ? "bg-white text-lavender shadow-sm ring-1 ring-charcoal/5" : "text-charcoal/40 hover:text-charcoal"
                                )}
                            >
                                E-Invites
                            </button>
                            <button
                                onClick={() => setActiveCategory('websites')}
                                className={cn(
                                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                    activeCategory === 'websites' ? "bg-white text-lavender shadow-sm ring-1 ring-charcoal/5" : "text-charcoal/40 hover:text-charcoal"
                                )}
                            >
                                E-Websites
                            </button>
                        </div>
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className={cn(
                            "grid gap-8 px-4",
                            activeCategory === 'invites' ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                        )}
                    >
                        {plans.map((plan, idx) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className={cn(
                                    "relative group flex flex-col h-full p-8 rounded-[40px] transition-all duration-500",
                                    plan.isRecommended 
                                        ? "bg-charcoal text-white ring-2 ring-lavender shadow-2xl shadow-charcoal/20 scale-105 z-10" 
                                        : "bg-pearl-white border border-charcoal/5 text-charcoal hover:border-lavender/30"
                                )}
                            >
                                {plan.isRecommended && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-lavender text-white text-[9px] font-black tracking-[0.2em] rounded-full uppercase shadow-lg flex items-center gap-1.5">
                                        <Sparkles size={10} className="fill-white" />
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-10">
                                    <h3 className={cn(
                                        "text-xl font-serif mb-2",
                                        plan.isRecommended ? "text-white" : "text-charcoal"
                                    )}>
                                        {plan.name}
                                    </h3>
                                    <p className={cn(
                                        "text-[10px] font-medium leading-relaxed",
                                        plan.isRecommended ? "text-white/60" : "text-charcoal/50"
                                    )}>
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="flex items-baseline gap-1 mb-10">
                                    <span className="text-sm font-black text-lavender">₹</span>
                                    <span className="text-4xl font-black tracking-tighter italic">{plan.price}</span>
                                </div>

                                <div className="flex-grow space-y-4 mb-10">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className={cn(
                                                "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                                plan.isRecommended ? "bg-white/10 text-lavender" : "bg-lavender/10 text-lavender"
                                            )}>
                                                <Check size={10} strokeWidth={3} />
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-bold leading-tight",
                                                plan.isRecommended ? "text-white/80" : "text-charcoal/70"
                                            )}>
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <Link 
                                    href={plan.href}
                                    className={cn(
                                        "flex items-center justify-center gap-2 w-full py-4 rounded-full font-black text-[10px] uppercase tracking-[0.15em] transition-all duration-300 active:scale-95",
                                        plan.isRecommended 
                                            ? "bg-lavender text-white hover:bg-[#9a6ab5] shadow-xl shadow-lavender/20" 
                                            : "bg-white text-charcoal border border-charcoal/10 hover:border-lavender/40 shadow-sm"
                                    )}
                                >
                                    {plan.cta}
                                    <ArrowRight size={14} />
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
};
