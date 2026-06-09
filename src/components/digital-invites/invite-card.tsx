"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play } from 'lucide-react';
import { getStartingPrice } from '@/lib/utils';
import { motion } from 'framer-motion';

interface InviteCardProps {
    design: any;
    showVideoIcon?: boolean;
}

export default function InviteCard({ design, showVideoIcon }: InviteCardProps) {
    const startingPrice = getStartingPrice(design);
    const firstImage = design.images?.[0] || '/placeholder.png';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative flex flex-col h-full bg-white rounded-none overflow-hidden border border-charcoal/5 transition-all duration-500 hover:shadow-2xl hover:shadow-lavender/10 hover:-translate-y-1"
        >
            {/* Image Container */}
            <Link href={`/catalog/${design.slug}`} className="relative aspect-square overflow-hidden block">
                <Image
                    src={firstImage}
                    alt={design.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Subtle Overlay on Hover */}
                <div className="absolute inset-0 bg-lavender/0 group-hover:bg-lavender/5 transition-colors duration-500" />

                {showVideoIcon && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-none bg-white/90 backdrop-blur-md flex items-center justify-center text-lavender shadow-lg group-hover:scale-110 transition-transform duration-500">
                            <Play size={16} fill="currentColor" />
                        </div>
                    </div>
                )}

                {design.isTrending && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-charcoal text-[8px] font-black px-2.5 py-1.5 rounded-full uppercase tracking-widest shadow-sm border border-charcoal/5">
                        🔥 Trending
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-4">
                    <p className="text-[8px] font-bold text-lavender/60 uppercase tracking-widest mb-1">{design.sku}</p>
                    <Link href={`/catalog/${design.slug}`}>
                        <h3 className="text-[10px] md:text-[11px] font-bold text-charcoal line-clamp-1 group-hover:text-lavender transition-colors duration-300 font-sans">
                            {design.name}
                        </h3>
                    </Link>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4">
                    <div>
                        <span className="text-[9px] text-neutral-400 block mb-0.5">Starting from</span>
                        <span className="text-xs font-bold text-[#ae7fcb]">₹{startingPrice}</span>
                    </div>

                    <Link
                        href={`/catalog/${design.slug}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-lavender/5 text-lavender rounded-none text-[9px] font-bold uppercase tracking-wider hover:bg-lavender hover:text-white transition-all duration-300 border border-lavender/10"
                    >
                        Customize
                        <ArrowRight size={12} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
