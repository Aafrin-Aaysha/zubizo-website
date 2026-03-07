"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DesignCardProps {
    id?: string;
    title: string;
    category: string;
    description?: string;
    imageUrl: string;
    price?: number;
    isTrending?: boolean;
    isNew?: boolean;
    variant?: "default" | "overlay";
    className?: string;
}

const DesignCard = ({
    id,
    title,
    category,
    description,
    imageUrl,
    price,
    isTrending,
    isNew,
    variant = "default",
    className,
}: DesignCardProps) => {
    const CardContent = (
        <>
            {variant === "overlay" ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -10 }}
                    className={cn(
                        "group relative aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-soft-grey shadow-premium transition-all duration-500 hover:shadow-2xl",
                        className
                    )}
                >
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent p-8 pt-20">
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/70">
                            {category}
                        </p>
                        <h3 className="mb-2 text-2xl font-bold text-white font-serif">{title}</h3>
                        {description && (
                            <p className="text-sm font-medium text-white/60 leading-relaxed max-w-[200px]">
                                {description}
                            </p>
                        )}
                    </div>
                    {(isTrending || isNew) && (
                        <div className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-charcoal backdrop-blur-md">
                            {isTrending ? "Trending" : "New"}
                        </div>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -10 }}
                    className={cn(
                        "group relative overflow-hidden rounded-3xl bg-white shadow-premium transition-all duration-500 hover:shadow-2xl border border-soft-grey/50",
                        className
                    )}
                >
                    <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {(isTrending || isNew) && (
                            <div className="absolute left-4 top-4 rounded-full bg-lavender/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                                {isTrending ? "Trending" : "New"}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-lavender">
                                {category}
                            </p>
                            {price && (
                                <p className="text-sm font-bold text-charcoal">
                                    ₹{price}
                                </p>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-charcoal font-serif">{title}</h3>
                        {description && (
                            <p className="mt-2 text-sm font-medium text-charcoal/40 line-clamp-2">
                                {description}
                            </p>
                        )}
                    </div>
                </motion.div>
            )}
        </>
    );

    if (id) {
        return (
            <Link href={`/catalog/${id}`} className="block">
                {CardContent}
            </Link>
        );
    }

    return CardContent;
};

export { DesignCard };
