"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    Check,
    Info,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ───────────────────────────────────────────────────────────────────
// ── Types ───────────────────────────────────────────────────────────────────
interface Package {
    _id: string;
    title: string;
    pricePerCard: number;
    inclusions: string[];
}

interface Design {
    _id: string;
    name: string;
    sku: string;
    slug: string;
    description?: string;
    images: string[];
    packages: Package[];
    minQuantity?: number;
    basePrice?: number;
    categoryId?: { name: string; slug: string };
}

// ── Components ──────────────────────────────────────────────────────────────

function ImageGallery({ images, name }: { images: string[]; name: string }) {
    const [current, setCurrent] = useState(0);
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [isZoomed, setIsZoomed] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setZoomPos({ x, y });
    };

    if (!images || images.length === 0) {
        return (
            <div className="aspect-[3/4] bg-gray-50 rounded-[2rem] flex items-center justify-center border border-gray-100 italic text-gray-300">
                No Preview Available
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div
                className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white border border-neutral-200 shadow-sm cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        className="w-full h-full relative"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <img
                            src={images[current]}
                            alt={name}
                            className={cn(
                                "w-full h-full object-cover transition-transform duration-200",
                                isZoomed ? "scale-150" : "scale-100"
                            )}
                            style={isZoomed ? {
                                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                            } : undefined}
                        />
                    </motion.div>
                </AnimatePresence>

                {images.length > 1 && (
                    <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); setCurrent(p => (p - 1 + images.length) % images.length); }}
                            className="pointer-events-auto w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-90"
                        >
                            <ChevronLeft size={24} className="text-charcoal" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setCurrent(p => (p + 1) % images.length); }}
                            className="pointer-events-auto w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-90"
                        >
                            <ChevronRight size={24} className="text-charcoal" />
                        </button>
                    </div>
                )}
            </div>

            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-2">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={cn(
                                "shrink-0 w-24 h-32 rounded-lg overflow-hidden border-2 transition-all duration-300",
                                current === idx
                                    ? "border-lavender shadow-md scale-105"
                                    : "border-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function DesignDetailClient({ design, whatsappNumber }: { design: Design; whatsappNumber: string }) {
    const safePackages = useMemo(() => {
        if (design.packages && design.packages.length > 0) return design.packages;
        return [{
            _id: 'default',
            title: 'Standard',
            pricePerCard: design.basePrice || 0,
            inclusions: ["Premium Material", "Custom Printing"]
        }];
    }, [design.packages, design.basePrice]);

    const [selectedPackage, setSelectedPackage] = useState<Package>(safePackages[0]);
    const [quantity, setQuantity] = useState<number | string>(design.minQuantity || 50);
    const [isLogging, setIsLogging] = useState(false);

    const estimatedTotal = useMemo(() => {
        if (!selectedPackage) return 0;
        const q = typeof quantity === 'string' ? parseInt(quantity) : quantity;
        if (isNaN(q)) return 0;
        return selectedPackage.pricePerCard * q;
    }, [selectedPackage, quantity]);

    const isInvalidQuantity = useMemo(() => {
        const q = typeof quantity === 'string' ? (quantity === '' ? 0 : parseInt(quantity)) : quantity;
        return q < (design.minQuantity || 50);
    }, [quantity, design.minQuantity]);

    const handleEnquire = async () => {
        setIsLogging(true);
        try {
            await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    designId: design._id,
                    designName: design.name,
                    sku: design.sku,
                    selectedPackage: selectedPackage.title,
                    quantity,
                    estimatedTotal,
                    source: 'detail'
                })
            });
        } catch (error) {
            console.error("Inquiry logging failed", error);
        }

        const message = `*Inquiry from Website*

Hello Zubizo, I'm interested in:
*Design:* ${design.name}
*SKU:* ${design.sku}
*Package:* ${selectedPackage.title}
*Inclusions:* ${selectedPackage.inclusions?.join(', ')}
*Quantity:* ${quantity} cards
*Price Estimate:* ₹${estimatedTotal.toLocaleString('en-IN')}

Please share further details.`;

        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
        setIsLogging(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Left: Info & Gallery (60%) */}
            <div className="lg:col-span-7 space-y-12">
                <ImageGallery images={design.images} name={design.name} />

                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 bg-lavender/10 text-lavender text-[11px] font-black uppercase tracking-[0.2em] rounded-full border border-lavender/20 shadow-sm">
                            {design.sku}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                            {design.categoryId?.name || 'Wedding Collection'}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-neutral-900 font-serif tracking-tight leading-[1.2]">
                        {design.name}
                    </h1>

                    <div className="w-20 h-1 bg-lavender/30 rounded-full" />

                    <p className="text-neutral-600 text-base leading-relaxed font-medium max-w-2xl">
                        {design.description || "An exquisite stationery masterwork designed for life's most cherished moments."}
                    </p>
                </div>
            </div>

            {/* Right: Configuration Panel (40%) */}
            <div className="lg:col-span-5 sticky top-28">
                <div className="bg-white rounded-2xl p-8 shadow-premium border border-neutral-100 space-y-8">
                    {/* Package Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-charcoal font-serif">Choose Package</h2>
                            <Info size={18} className="text-gray-300 cursor-help" />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {safePackages.map((pkg) => (
                                <button
                                    key={pkg._id}
                                    onClick={() => setSelectedPackage(pkg)}
                                    className={cn(
                                        "w-full p-5 rounded-xl border-2 text-left transition-all relative group",
                                        selectedPackage._id === pkg._id
                                            ? "border-lavender bg-lavender/[0.02] shadow-sm"
                                            : "border-neutral-50 hover:border-lavender/20 bg-neutral-50/30"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                selectedPackage._id === pkg._id ? "border-lavender bg-lavender scale-110" : "border-gray-200"
                                            )}>
                                                {selectedPackage._id === pkg._id && <Check size={14} className="text-white" />}
                                            </div>
                                            <span className={cn("font-black text-base tracking-tight", selectedPackage._id === pkg._id ? "text-charcoal" : "text-gray-500")}>
                                                {pkg.title}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-black text-charcoal block">₹{pkg.pricePerCard}</span>
                                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">per card</span>
                                        </div>
                                    </div>

                                    {/* Inclusions */}
                                    <div className="space-y-2 mt-2">
                                        {pkg.inclusions?.map((inc, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                <div className="w-1 h-1 rounded-full bg-green-500" />
                                                {inc}
                                            </div>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity Selection */}
                    <div className="pt-8 border-t border-gray-50">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-charcoal font-serif">Quantity</h2>
                            <div className="text-right">
                                <span className="text-[10px] text-lavender font-black uppercase tracking-widest block mb-1">Scale Discounts</span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">Available for bulk orders</span>
                            </div>
                        </div>

                        <div className="relative group mb-4">
                            <input
                                type="number"
                                placeholder="Enter quantity..."
                                value={quantity}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                        setQuantity('');
                                        return;
                                    }
                                    setQuantity(parseInt(val) || 0);
                                }}
                                className={cn(
                                    "w-full h-14 pl-6 pr-20 bg-neutral-100 border rounded-lg font-bold text-base transition-all outline-none",
                                    (typeof quantity === 'number' && quantity > 0 && quantity < (design.minQuantity || 50))
                                        ? "border-red-200 bg-red-50/30 text-red-600"
                                        : "border-neutral-200 text-neutral-800 focus:border-lavender/40 focus:bg-white"
                                )}
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Cards</span>
                        </div>

                        {typeof quantity === 'number' && quantity > 0 && quantity < (design.minQuantity || 50) && (
                            <p className="flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                                <Info size={12} />
                                Minimum order is {design.minQuantity || 50} cards
                            </p>
                        )}
                        {(!quantity || (typeof quantity === 'number' && quantity >= (design.minQuantity || 50))) && (
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Minimum order: {design.minQuantity || 50} cards
                            </p>
                        )}
                    </div>

                    {/* Pricing Summary */}
                    <div className="pt-2">
                        <div className="bg-charcoal rounded-[2rem] p-8 shadow-2xl space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] text-white/40 font-bold uppercase tracking-[0.25em]">
                                    <span>{selectedPackage.title}</span>
                                    <span>₹{selectedPackage.pricePerCard} × {typeof quantity === 'string' ? (parseInt(quantity) || 0) : quantity}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-white/40 font-bold uppercase tracking-[0.25em]">
                                    <span>Personalization</span>
                                    <span className="text-green-400">Included</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-white/40 font-bold uppercase tracking-[0.25em]">
                                    <span>Envelope + Wax</span>
                                    <span>Standard</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                                <div>
                                    <span className="text-[10px] text-lavender font-black uppercase tracking-[0.3em] block mb-1">Total Estimate</span>
                                    <span className="text-4xl font-black text-white tracking-tight">₹{estimatedTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <span className="text-[9px] text-white/30 font-bold mb-1 uppercase tracking-widest">* Excl. Shipping</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleEnquire}
                        disabled={isLogging || isInvalidQuantity}
                        className="w-full h-14 bg-lavender hover:bg-[#9a6ab5] text-white rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-4 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isLogging ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>
                                <MessageCircle size={24} />
                                <span>Enquire on WhatsApp</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-[11px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <Check size={14} className="text-green-500" />
                        Free design proof within 24 hours
                    </p>
                </div>
            </div>
        </div>
    );
}
