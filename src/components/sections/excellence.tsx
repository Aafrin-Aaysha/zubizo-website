"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

const Excellence = () => {
    return (
        <section className="py-24 sm:py-32 overflow-hidden bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h2 className="text-5xl font-bold tracking-tight text-charcoal sm:text-6xl font-serif mb-8">
                            The Zubizo Standard <br /> of Excellence
                        </h2>
                        <p className="text-lg text-charcoal/60 leading-relaxed font-sans mb-12 max-w-lg">
                            Our passion lies in the tactile beauty of paper. We combine
                            centuries-old print techniques with modern digital artistry to
                            create stationery that doesn't just invite — it inspires.
                        </p>

                        <ul className="space-y-6">
                            {[
                                { title: "Artisanal Craftsmanship", desc: "Every piece hand-finished by our master stationers." },
                                { title: "Unlimited Customization", desc: "Work directly with designers to match your vision perfectly." }
                            ].map((item, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="mt-1 flex-shrink-0">
                                        <CheckCircle2 className="h-6 w-6 text-lavender" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-charcoal font-sans">{item.title}</h4>
                                        <p className="text-sm text-charcoal/40 font-medium">{item.desc}</p>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Image Column */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative aspect-square w-full"
                    >
                        <div className="absolute -inset-4 bg-lavender/5 rounded-[4rem] -z-10 blur-2xl" />
                        <div className="relative h-full w-full overflow-hidden rounded-[3rem] shadow-premium">
                            <Image
                                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop"
                                alt="Standard of Excellence"
                                fill
                                className="object-cover"
                            />
                            {/* Decorative element */}
                            <div className="absolute top-8 right-8 h-20 w-20 border-t-2 border-r-2 border-white/30 rounded-tr-3xl" />
                            <div className="absolute bottom-8 left-8 h-20 w-20 border-b-2 border-l-2 border-white/30 rounded-bl-3xl" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export { Excellence };
