"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play } from 'lucide-react';
import { getStartingPrice, getWhatsAppNumber } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LeadCaptureModal } from '@/components/ui/LeadCaptureModal';

interface InviteCardProps {
    design: any;
    showVideoIcon?: boolean;
}

export default function InviteCard({ design, showVideoIcon }: InviteCardProps) {
    const startingPrice = getStartingPrice(design);
    const firstImage = design.images?.[0] || '/placeholder.png';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const isWebsite = !!(design.demoUrl && design.demoUrl.trim() !== '');

    const handleCardClick = () => {
        if (isWebsite) {
            window.open(design.demoUrl, '_blank');
        } else {
            setIsLightboxOpen(true);
        }
    };

    // Badge configuration
    const badges = [];
    if (isWebsite && design.packageName) {
        let emoji = "✨";
        let color = "bg-purple-50/90 text-purple-700 border-purple-200";
        if (design.packageName === 'Starter') {
            emoji = "⭐";
            color = "bg-blue-50/90 text-blue-700 border-blue-200";
        } else if (design.packageName === 'Value') {
            emoji = "⚡";
            color = "bg-green-50/90 text-green-700 border-green-200";
        } else if (design.packageName === 'Premium') {
            emoji = "👑";
            color = "bg-amber-50/90 text-amber-700 border-amber-200";
        } else if (design.packageName === 'Ultra') {
            emoji = "💎";
            color = "bg-pink-50/90 text-pink-700 border-pink-200";
        }
        badges.push({ text: `${design.packageName} Package`, emoji, color });
    }

    if (design.isTrending) {
        badges.push({ text: "Trending", emoji: "🔥", color: "bg-amber-50/90 text-amber-700 border-amber-200" });
    }

    if (design.isBestSeller) {
        badges.push({ text: "Best Seller", emoji: "👑", color: "bg-emerald-50/90 text-emerald-700 border-emerald-200" });
    }

    const handleModalSubmit = async (data: any) => {
        const pageUrl = `${window.location.origin}/catalog/${design.slug}`;
        
        try {
            await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    designId: design._id,
                    designName: design.name,
                    sku: design.sku,
                    selectedPackage: design.packages?.[0]?.title || 'Digital Delivery',
                    quantity: 1,
                    estimatedTotal: startingPrice,
                    source: 'card_enquiry',
                    customerName: data.name,
                    phone: data.phone,
                    notes: `Direct Card Enquiry. Image: ${firstImage}`
                })
            });
        } catch (error) {
            console.error("Inquiry logging failed", error);
        }

        const priceLine = isWebsite ? `\n*Price:* ₹${startingPrice || design.basePrice || 0}` : '';
        const message = `*Inquiry from Website (E-Invite)*
  
Hello Zubizo,
  
My name is ${data.name}.
My contact number is ${data.phone}.
  
I'm interested in:
*Design:* ${design.name}
*SKU:* ${design.sku}${priceLine}
  
Please share further details.`;

        const cleanNumber = getWhatsAppNumber();
        window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
        setIsModalOpen(false);
    };

    return (
        <>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_36px_rgba(110,75,139,0.07)] flex flex-col h-full transition-all duration-300 hover:-translate-y-1"
            >
                {/* Image Container */}
                <div 
                    onClick={handleCardClick}
                    className="relative aspect-[3/4] overflow-hidden block bg-slate-50 cursor-pointer"
                >
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
                    
                    {/* Subtle Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

                    {showVideoIcon && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="w-10 h-10 rounded-md bg-white/90 backdrop-blur-md flex items-center justify-center text-lavender shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <Play size={16} fill="currentColor" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                    <div className="mb-3">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{design.sku}</p>
                        <h3 
                            onClick={handleCardClick}
                            className="font-bold text-slate-800 hover:text-[#6E4B8B] transition-colors line-clamp-2 font-sans text-xs md:text-sm leading-snug cursor-pointer"
                        >
                            {design.name}
                        </h3>
                    </div>

                    {/* Action Area */}
                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                        {isWebsite ? (
                            <>
                                <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Price</span>
                                    <span className="text-sm font-extrabold text-[#6E4B8B]">₹{startingPrice || design.basePrice || 0}</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsModalOpen(true);
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-[#6E4B8B] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#5A3B75] transition-all cursor-pointer shadow-md shadow-[#6E4B8B]/10 active:scale-95"
                                >
                                    <span>Enquire</span>
                                    <ArrowRight size={12} />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsModalOpen(true);
                                }}
                                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#6E4B8B] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#5A3B75] transition-all cursor-pointer shadow-md shadow-[#6E4B8B]/10 active:scale-95"
                            >
                                <span>Enquire</span>
                                <ArrowRight size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            <LeadCaptureModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsLightboxOpen(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-zoom-out"
                    >
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsLightboxOpen(false);
                            }}
                            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-300 backdrop-blur-sm shadow-lg border border-white/10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative max-w-4xl max-h-[90vh] aspect-[3/4] w-full md:w-auto md:h-[85vh] overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-black/40"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={firstImage}
                                alt={design.name}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, 85vh"
                                priority
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
