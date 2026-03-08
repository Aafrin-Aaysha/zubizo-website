"use client";

import * as React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
const { Feather, Paintbrush, ShieldCheck, Zap } = Icons;

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

const ArtisanProcess = ({ styling, title, subtitle, description, data }: any) => {
    const displaySteps = (data?.steps && data.steps.length > 0) ? data.steps.map((s: any) => ({
        ...s,
        icon: typeof s.icon === 'string' ? (Icons as any)[s.icon] : (s.icon || Feather)
    })) : steps;

    return (
        <section
            className="py-16 md:py-20 px-8 sm:px-12"
            style={{ backgroundColor: styling?.backgroundColor }}
        >
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 text-center">
                    <span className="font-sans text-[12px] font-semibold uppercase tracking-widest text-lavender mb-4 block">
                        {subtitle || "THE CRAFTSMANSHIP"}
                    </span>
                    <h2 className="text-[36px] font-medium text-charcoal font-serif mb-4">
                        {title || "Our Artisan Process"}
                    </h2>
                    {description && (
                        <p className="text-charcoal/60 font-sans text-sm max-w-2xl mx-auto leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {displaySteps.map((step: any, index: number) => (
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
                            </div>
                            <h3 className="text-lg font-bold text-charcoal mb-3 font-serif">
                                {step.title}
                            </h3>
                            <p className="text-sm font-medium text-charcoal/60 leading-relaxed font-sans">
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
