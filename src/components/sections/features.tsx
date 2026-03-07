"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Feather, Paintbrush, Leaf } from "lucide-react";

const features = [
    {
        title: "Premium Paper",
        description: "Hand-selected textures from sustainable global sources.",
        icon: Feather,
    },
    {
        title: "Custom Designs",
        description: "Bespoke artwork tailored to your unique celebration story.",
        icon: Paintbrush,
    },
    {
        title: "Eco-friendly",
        description: "Sustainable practices in every step of our boutique production.",
        icon: Leaf,
    },
];

const FeatureCards = () => {
    return (
        <section className="relative z-20 py-12 px-4 -mt-16 sm:-mt-24">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.8 }}
                            className="group rounded-[2rem] bg-white p-10 text-center shadow-premium transition-all hover:-translate-y-2 hover:shadow-2xl border border-soft-grey/50"
                        >
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lavender/10 text-lavender transition-colors group-hover:bg-lavender group-hover:text-white">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold font-serif text-charcoal">
                                {feature.title}
                            </h3>
                            <p className="text-sm font-medium leading-relaxed text-charcoal/40">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export { FeatureCards };
