"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    Check,
    ArrowRight,
    Loader2,
    Plus
} from 'lucide-react';
import { cn, getWhatsAppNumber } from '@/lib/utils';

// ── Types ───────────────────────────────────────────────────────────────────
interface PriceTier {
    minQty: number;
    maxQty?: number | null;
    pricePerCard: number;
}

interface AddOn {
    label: string;
    pricePerCard: number;
    note?: string;
}

interface Package {
    _id: string;
    title: string;
    inclusions: string[];
    priceTiers: PriceTier[];
    pricePerCard?: number; // legacy fallback
}

interface Design {
    _id: string;
    name: string;
    sku: string;
    slug: string;
    description?: string;
    images: string[];
    packages: Package[];
    addOns?: AddOn[];
    minQuantity?: number;
    basePrice?: number;
    categoryId?: { name: string; slug: string };
}

// ── Helper ───────────────────────────────────────────────────────────────────
function getTierPrice(tiers: PriceTier[], qty: number): PriceTier | null {
    if (!tiers || tiers.length === 0) return null;
    return tiers.find(t => qty >= t.minQty && (t.maxQty == null || qty <= t.maxQty)) || null;
}

function formatTierLabel(tier: PriceTier, index: number, tiers: PriceTier[]): string {
    const isLast = index === tiers.length - 1;
    if (isLast && tier.maxQty == null) {
        return `${tier.minQty}+ cards`;
    }
    if (tier.maxQty != null && tier.maxQty === tier.minQty) {
        return `${tier.minQty} cards`;
    }
    return `${tier.minQty} – ${tier.maxQty ?? '∞'} cards`;
}

// ── Image Gallery ────────────────────────────────────────────────────────────
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
                className="relative aspect-[3/4] floating-card rounded-[2rem] overflow-hidden bg-white border border-lavender/10 cursor-zoom-in group"
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

// ── Main ─────────────────────────────────────────────────────────────────────
export function DesignDetailClient({ design }: { design: Design }) {
    const safePackages = useMemo(() => {
        if (design.packages && design.packages.length > 0) return design.packages;
        return [{
            _id: 'default',
            title: 'Standard',
            inclusions: ["Premium Material", "Custom Printing"],
            priceTiers: [{ minQty: design.minQuantity || 50, maxQty: null, pricePerCard: design.basePrice || 0 }],
        }];
    }, [design.packages, design.basePrice]);

    const [selectedPackage, setSelectedPackage] = useState<Package>(safePackages[0]);
    const [quantity, setQuantity] = useState<number | string>(design.minQuantity || 100);
    const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
    const [isLogging, setIsLogging] = useState(false);

    const addOns: AddOn[] = design.addOns || [];

    const activeTier = useMemo(() => {
        const q = typeof quantity === 'string' ? (parseInt(quantity) || 0) : quantity;
        return getTierPrice(selectedPackage.priceTiers || [], q);
    }, [selectedPackage, quantity]);

    const isInvalidQuantity = useMemo(() => {
        const q = typeof quantity === 'string' ? (quantity === '' ? 0 : parseInt(quantity)) : quantity;
        return q < (design.minQuantity || 50);
    }, [quantity, design.minQuantity]);

    const toggleAddOn = (label: string) => {
        setSelectedAddOns(prev =>
            prev.includes(label) ? prev.filter(a => a !== label) : [...prev, label]
        );
    };

    const handleEnquire = async () => {
        setIsLogging(true);
        const q = typeof quantity === 'string' ? parseInt(quantity) : quantity;

        try {
            await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    designId: design._id,
                    designName: design.name,
                    sku: design.sku,
                    selectedPackage: selectedPackage.title,
                    quantity: q,
                    estimatedTotal: 0,
                    source: 'detail',
                    addOns: selectedAddOns
                })
            });
        } catch (error) {
            console.error("Inquiry logging failed", error);
        }

        const addOnText = selectedAddOns.length > 0
            ? `\n*Add-ons:* ${selectedAddOns.join(', ')}`
            : '';

        const tierText = activeTier
            ? `\n*Price Per Card:* ₹${activeTier.pricePerCard} (for ${q} cards)`
            : '';

        const message = `*Inquiry from Website*

Hello Zubizo, I'm interested in:
*Design:* ${design.name}
*SKU:* ${design.sku}
*Package:* ${selectedPackage.title}
*Inclusions:* ${selectedPackage.inclusions?.join(', ')}
*Quantity:* ${q} cards${tierText}${addOnText}

Please share further details.`;

        const cleanNumber = getWhatsAppNumber();
        window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
        setIsLogging(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Left: Gallery + Description */}
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

            {/* Right: Configuration Panel */}
            <div className="lg:col-span-5 sticky top-28">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-luxury border border-lavender/10 space-y-8 floating-card">

                    {/* Package Selection */}
                    {safePackages.length > 1 && (
                        <div>
                            <h2 className="text-2xl font-black text-charcoal font-serif mb-6">Choose Package</h2>
                            <div className="grid grid-cols-1 gap-3">
                                {safePackages.map((pkg) => (
                                    <button
                                        key={pkg._id}
                                        onClick={() => setSelectedPackage(pkg)}
                                        className={cn(
                                            "w-full p-4 rounded-[1.5rem] border outline-none text-left transition-all duration-300",
                                            selectedPackage._id === pkg._id
                                                ? "border-lavender bg-lavender/5 shadow-sm"
                                                : "border-transparent bg-gray-50/50 hover:bg-gray-50 hover:border-lavender/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                                                selectedPackage._id === pkg._id ? "border-lavender bg-lavender" : "border-gray-200"
                                            )}>
                                                {selectedPackage._id === pkg._id && <Check size={12} className="text-white" />}
                                            </div>
                                            <span className={cn("font-black text-sm tracking-tight", selectedPackage._id === pkg._id ? "text-charcoal" : "text-gray-500")}>
                                                {pkg.title}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Inclusions */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">What's Included</h3>
                        <div className="space-y-2">
                            {selectedPackage.inclusions?.map((inc, i) => (
                                <div key={i} className="flex items-start gap-2.5 text-sm text-charcoal/80 font-medium">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-lavender shrink-0" />
                                    {inc}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Tiers */}
                    {selectedPackage.priceTiers && selectedPackage.priceTiers.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Price Per Card</h3>
                            <div className="rounded-[1.5rem] border border-gray-100 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/80 text-gray-400 text-[10px] uppercase tracking-widest font-black">
                                            <th className="px-5 py-3 text-left">Quantity</th>
                                            <th className="px-5 py-3 text-right">Per Card</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {selectedPackage.priceTiers.map((tier, idx) => {
                                            const q = typeof quantity === 'string' ? (parseInt(quantity) || 0) : quantity;
                                            const isActive = q >= tier.minQty && (tier.maxQty == null || q <= tier.maxQty);
                                            return (
                                                <tr
                                                    key={idx}
                                                    className={cn(
                                                        "transition-colors",
                                                        isActive ? "bg-lavender/5" : "bg-white hover:bg-gray-50/50"
                                                    )}
                                                >
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {isActive && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-lavender inline-block shrink-0" />
                                                            )}
                                                            <span className={cn("font-bold", isActive ? "text-charcoal" : "text-gray-500")}>
                                                                {formatTierLabel(tier, idx, selectedPackage.priceTiers)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <span className={cn("font-black", isActive ? "text-lavender text-base" : "text-gray-500")}>
                                                            ₹{tier.pricePerCard}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Quantity Input */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Your Quantity</h3>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Enter quantity..."
                                value={quantity}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') { setQuantity(''); return; }
                                    setQuantity(parseInt(val) || 0);
                                }}
                                className={cn(
                                    "w-full h-14 pl-6 pr-20 bg-white border-2 rounded-[1rem] font-bold text-base transition-all outline-none placeholder:font-medium placeholder:text-gray-400",
                                    isInvalidQuantity
                                        ? "border-red-200 bg-red-50/50 text-red-600 focus:border-red-400"
                                        : "border-gray-100 text-charcoal focus:border-lavender"
                                )}
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Cards</span>
                        </div>
                        {isInvalidQuantity && (
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                                Minimum order is {design.minQuantity || 50} cards
                            </p>
                        )}
                    </div>

                    {/* Add-ons */}
                    {addOns.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Optional Add-ons</h3>
                            <div className="space-y-2">
                                {addOns.map((addOn, idx) => {
                                    const isSelected = selectedAddOns.includes(addOn.label);
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => toggleAddOn(addOn.label)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-5 py-3.5 rounded-[1.2rem] border text-left transition-all duration-200",
                                                isSelected
                                                    ? "border-lavender bg-lavender/5"
                                                    : "border-gray-100 hover:border-lavender/30 hover:bg-gray-50/50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                                                    isSelected ? "border-lavender bg-lavender" : "border-gray-200"
                                                )}>
                                                    {isSelected && <Check size={12} className="text-white" />}
                                                </div>
                                                <span className={cn("text-sm font-bold", isSelected ? "text-charcoal" : "text-gray-600")}>
                                                    {addOn.label}
                                                </span>
                                            </div>
                                            <span className={cn("text-sm font-black shrink-0", isSelected ? "text-lavender" : "text-gray-400")}>
                                                {addOn.pricePerCard === 0
                                                    ? (addOn.note || 'Free')
                                                    : `+₹${addOn.pricePerCard}/card`}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Enquire Button */}
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
                        Free design proof within 48 hours
                    </p>
                </div>
            </div>
        </div>
    );
}
