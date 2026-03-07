import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function DesignCard({ design }: { design: any }) {
    // Find starting price (lowest package price)
    const startingPrice = design.packages && design.packages.length > 0
        ? Math.min(...design.packages.map((p: any) => p.pricePerCard))
        : design.basePrice || 0;

    const firstImage = design.images?.[0] || '/placeholder.png';

    return (
        <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 border border-neutral-200 flex flex-col h-full">
            {/* Image Container */}
            <Link href={`/catalog/${design.slug}`} className="relative aspect-[3/4] overflow-hidden block">
                <Image
                    src={firstImage}
                    alt={design.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

                {design.isTrending && (
                    <div className="absolute top-3 left-3 bg-amber-400 text-white text-[8px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                        🔥 Trending
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-4">
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1">{design.sku}</p>
                    <Link href={`/catalog/${design.slug}`}>
                        <h3 className="text-lg font-bold text-neutral-800 line-clamp-2 hover:text-lavender transition-colors duration-300 leading-snug">
                            {design.name}
                        </h3>
                    </Link>
                </div>

                {/* Price Preview */}
                <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                        <span className="text-xs text-neutral-400 block mb-0.5">Starting from</span>
                        <span className="text-xl font-bold text-neutral-900">₹{startingPrice}</span>
                    </div>

                    <Link
                        href={`/catalog/${design.slug}`}
                        className="w-10 h-10 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-lavender hover:border-lavender transition-all group/btn"
                    >
                        <ArrowRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
