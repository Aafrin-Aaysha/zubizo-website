import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getStartingPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function DesignCard({ design }: { design: any }) {
    const startingPrice = getStartingPrice(design);
    const firstImage = design.images?.[0] || '/placeholder.png';

    // Badge configuration
    const badges = [];
    if (design.isTrending) {
        badges.push({ text: "Best Seller", emoji: "👑", color: "bg-emerald-50/90 text-emerald-700 border-emerald-200" });
    }
    if (design.isFeatured) {
        badges.push({ text: "Trending", emoji: "🔥", color: "bg-amber-50/90 text-amber-700 border-amber-200" });
    }

    return (
        <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_36px_rgba(110,75,139,0.07)] flex flex-col h-full transition-all duration-300 hover:-translate-y-1">
            {/* Image Container */}
            <Link href={`/catalog/${design.slug}`} className="relative aspect-[3/4] overflow-hidden block bg-slate-50">
                {/* Badges Container */}
                {badges.length > 0 && (
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
                        {badges.slice(0, 2).map((badge, idx) => (
                            <div 
                                key={idx} 
                                className={cn(
                                    "backdrop-blur-md text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border shadow-sm flex items-center gap-1",
                                    badge.color
                                )}
                            >
                                <span>{badge.emoji}</span>
                                <span>{badge.text}</span>
                            </div>
                        ))}
                    </div>
                )}

                <Image
                    src={firstImage}
                    alt={design.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{design.sku}</p>
                    <Link href={`/catalog/${design.slug}`}>
                        <h3 className="font-bold text-slate-800 hover:text-[#6E4B8B] transition-colors line-clamp-2 font-sans text-xs md:text-sm leading-snug">
                            {design.name}
                        </h3>
                    </Link>
                </div>

                {/* Price Preview */}
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Starting from</span>
                        <span className="text-sm font-extrabold text-[#6E4B8B]">₹{startingPrice}</span>
                    </div>

                    <Link
                        href={`/catalog/${design.slug}`}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#6E4B8B] hover:border-[#6E4B8B] transition-all group/btn cursor-pointer"
                    >
                        <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
