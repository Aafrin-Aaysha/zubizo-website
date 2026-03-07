"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const categories = [
    {
        name: "New Collections",
        href: "/collections/new",
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200&auto=format&fit=crop",
        className: "col-span-1 row-span-2",
    },
    {
        name: "Wedding Specials",
        href: "/collections/wedding",
        image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1200&auto=format&fit=crop",
        className: "col-span-1",
    },
    {
        name: "Traditional Designs",
        href: "/collections/traditional",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
        className: "col-span-1",
    },
    {
        name: "Minimal & Modern",
        href: "/collections/minimal",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
        className: "col-span-2",
    },
];

const CategoryGrid = () => {
    return (
        <section className="bg-soft-grey py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-charcoal sm:text-4xl font-serif">
                        Explore by Category
                    </h2>
                    <p className="mt-4 text-lg text-charcoal/60">
                        Find the perfect invitation for every occasion.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "group relative overflow-hidden rounded-3xl bg-white shadow-sm",
                                category.className
                            )}
                        >
                            <Link href={category.href} className="block h-full w-full">
                                <div className="relative h-full min-h-[300px] w-full overflow-hidden">
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-charcoal/20 transition-colors duration-500 group-hover:bg-charcoal/40" />
                                    <div className="absolute inset-0 flex items-end p-8">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white font-serif">
                                                {category.name}
                                            </h3>
                                            <div className="mt-2 flex h-1 w-0 bg-lavender transition-all duration-500 group-hover:w-full" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export { CategoryGrid };
