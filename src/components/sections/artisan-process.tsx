"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Feather, Paintbrush, ShieldCheck, Zap } from "lucide-react";

const steps = [
    {
        title: "Concept & Design",
        description: "Our artists hand-sketch every detail, ensuring each design is as unique as your story.",
        icon: Paintbrush,
    },
    {
        title: "Paper Curation",
        description: "We source the finest artisanal paper from around the globe for a tactile premium feel.",
        icon: Feather,
    },
    {
        title: "Masterful Craft",
        description: "Traditional gold foiling and letterpress techniques meet modern precision printing.",
        icon: Zap,
    },
    {
        title: "Quality Review",
        description: "Every single piece is hand-inspected to ensure it meets the Zubizo standard of excellence.",
        icon: ShieldCheck,
    },
];

const ArtisanProcess = () => {
    return (
        <section className="bg-soft-grey/30 py-24 rounded-[4rem] px-8 sm:px-12">
            <div className="mx-auto max-w-7xl">
                <div className="mb-20 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-lavender block mb-4">
                        The Craftsmanship
                    </span>
                    <h2 className="text-4xl font-bold text-charcoal sm:text-5xl font-serif">
                        Our Artisan Process
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.8 }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="mb-8 relative">
                                <div className="h-16 w-16 rounded-3xl bg-white shadow-premium flex items-center justify-center text-lavender group-hover:bg-lavender group-hover:text-white transition-all duration-500">
                                    <step.icon className="h-6 w-6" />
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-8 left-full w-full h-[1px] bg-charcoal/10 -z-10" />
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-charcoal mb-3 font-serif">
                                {step.title}
                            </h3>
                            <p className="text-sm font-medium text-charcoal/40 leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export { ArtisanProcess };
