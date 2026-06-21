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
    Plus,
    Info,
    Sparkles,
    X
} from 'lucide-react';
import { cn, getWhatsAppNumber } from '@/lib/utils';
import { LeadCaptureModal, LeadData } from '@/components/ui/LeadCaptureModal';

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
    options?: {
        hasEnvelope?: boolean;
        hasRibbon?: boolean;
        hasWaxSeal?: boolean;
        hasChart?: boolean;
        displayModelColours?: string;
        envelopeTierBSurcharge?: number;
        envelopeTierCSurcharge?: number;
        ribbonPremiumSurcharge?: number;
        images?: { [key: string]: string };
    };
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
        <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Thumbnails (Left-aligned on Desktop, Bottom on Mobile) */}
            {images.length > 1 && (
                <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 scrollbar-hide px-1 lg:w-20 lg:shrink-0 lg:h-[78vh] lg:max-h-[750px] order-2 lg:order-1 w-full lg:w-auto">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={cn(
                                "shrink-0 w-20 h-26 lg:w-20 lg:h-26 rounded-lg overflow-hidden border-2 transition-all duration-300",
                                current === idx
                                    ? "border-[#ae7fcb] shadow-md scale-105"
                                    : "border-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Main Image (Right-aligned on Desktop, Top on Mobile) */}
            <div
                className="relative flex-1 w-full aspect-[3/4] lg:aspect-auto lg:h-[78vh] lg:max-h-[750px] floating-card rounded-[2rem] overflow-hidden bg-white border border-lavender/10 cursor-zoom-in group order-1 lg:order-2"
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
                                "w-full h-full object-cover",
                                isZoomed ? "scale-150" : "scale-100 transition-transform duration-300 ease-out"
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
                            <ChevronLeft size={24} className="text-slate-800" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setCurrent(p => (p + 1) % images.length); }}
                            className="pointer-events-auto w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-90"
                        >
                            <ChevronRight size={24} className="text-slate-800" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Options Registry & Helpers ───────────────────────────────────────────────
const DEFAULT_OPTION_IMAGES: { [key: string]: string } = {
    // Envelope Types
    'envelope_type_landscape': 'https://images.unsplash.com/photo-1595121404116-24e5480b06b6?w=400&q=80',
    'envelope_type_portrait': 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400&q=80',
    'envelope_type_pouch': 'https://images.unsplash.com/photo-1626125345510-4603468eedfb?w=400&q=80',

    // Envelope Colours
    'envelope_colour_ivory': 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=300&q=80',
    'envelope_colour_champagne': 'https://images.unsplash.com/photo-1562259929-b4e1fd30ec40?w=300&q=80',
    'envelope_colour_white': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&q=80',
    'envelope_colour_blush': 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=300&q=80',
    'envelope_colour_charcoal': 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=300&q=80',
    'envelope_colour_black': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&q=80',
    'envelope_colour_sage': 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=300&q=80',
    'envelope_colour_navy': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
    'envelope_colour_forest_green': 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=300&q=80',
    'envelope_colour_burgundy': 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=300&q=80',
    'envelope_colour_royal_blue': 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=300&q=80',
    'envelope_colour_lavender': 'https://images.unsplash.com/photo-1528459199957-0ff28496a7f6?w=300&q=80',
    'envelope_colour_rose_gold': 'https://images.unsplash.com/photo-1502239608882-93b729c6af43?w=300&q=80',
    'envelope_colour_gold': 'https://images.unsplash.com/photo-1588600878108-57c6118d8c65?w=300&q=80',
    'envelope_colour_silver': 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=300&q=80',
    'envelope_colour_coral': 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?w=300&q=80',
    'envelope_colour_teal': 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=300&q=80',

    // Ribbon Materials
    'ribbon_material_satin': 'https://images.unsplash.com/photo-1554189097-ffe88e998a2b?w=300&q=80',
    'ribbon_material_organza': 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=300&q=80',

    // Ribbon Widths
    'ribbon_width_6mm': 'https://images.unsplash.com/photo-1551893087-59306cb815db?w=300&q=80',
    'ribbon_width_15mm': 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=300&q=80',
    'ribbon_width_25mm': 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=300&q=80',

    // Ribbon Colours
    'ribbon_colour_ivory': 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=300&q=80',
    'ribbon_colour_white': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&q=80',
    'ribbon_colour_blush': 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=300&q=80',
    'ribbon_colour_sage': 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=300&q=80',
    'ribbon_colour_navy': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
    'ribbon_colour_gold': 'https://images.unsplash.com/photo-1588600878108-57c6118d8c65?w=300&q=80',
    'ribbon_colour_burgundy': 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=300&q=80',

    // Wax Seals
    'wax_seal_bronze_round': 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=300&q=80',
    'wax_seal_gold_round': 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=300&q=80',
    'wax_seal_custom': 'https://images.unsplash.com/photo-1506784365847-bbad939e916a?w=300&q=80',

    // Chart Types
    'chart_single_card': 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=300&q=80',
    'chart_tri_fold': 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=300&q=80',
    'chart_booklet': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80',

    // Package Textures
    'package_texture_matte': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&q=80',
    'package_texture_textured': 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=300&q=80',
    'package_texture_glossy': 'https://images.unsplash.com/photo-1502239608882-93b729c6af43?w=300&q=80',
};

function ShimmerImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
        <div className="relative w-full h-full overflow-hidden bg-gray-50">
            {!isLoaded && (
                <div className="absolute inset-0 shimmer-animation" />
            )}
            <img
                src={src}
                alt={alt}
                className={cn(className, "transition-opacity duration-300", isLoaded ? "opacity-100" : "opacity-0")}
                onLoad={() => setIsLoaded(true)}
            />
        </div>
    );
}

function getOptionImage(key: string, overrides?: { [key: string]: string }) {
    return overrides?.[key] || DEFAULT_OPTION_IMAGES[key] || '';
}

interface SwatchProps {
    label: string;
    imageKey: string;
    isSelected: boolean;
    overrides?: { [key: string]: string };
    surcharge: number;
    onClick: () => void;
    onMouseEnter: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
    onClickMobile: () => void;
}

const SwatchCard = React.memo(function SwatchCard({ 
    label, 
    imageKey, 
    isSelected, 
    overrides, 
    surcharge, 
    onClick, 
    onMouseEnter, 
    onMouseLeave, 
    onClickMobile 
}: SwatchProps) {
    const imgUrl = getOptionImage(imageKey, overrides);
    const isWhite = label.toLowerCase() === 'white';
    
    return (
        <button
            type="button"
            onClick={() => {
                onClick();
                onClickMobile();
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={cn(
                "group relative flex flex-col items-center gap-1.5 p-1 rounded-xl border-2 transition-all duration-200 shrink-0 select-none cursor-pointer outline-none snap-start",
                isSelected 
                    ? "border-[#7C3AED] bg-[#F5F0FF] scale-105" 
                    : "border-transparent hover:border-[#9B5CDE] hover:scale-105"
            )}
        >
            <div className={cn(
                "relative w-[36px] h-[36px] md:w-[48px] md:h-[48px] rounded-lg overflow-hidden shrink-0",
                isWhite && "shadow-inner border border-gray-150"
            )}>
                <ShimmerImage src={imgUrl} alt={label} className="w-full h-full object-cover" />
                
                {isSelected && (
                    <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#7C3AED] flex items-center justify-center shadow-md z-10">
                        <Check size={8} className="text-white" strokeWidth={4} />
                    </div>
                )}
            </div>
            <span className={cn(
                "text-[9px] font-medium tracking-tight text-slate-500 text-center truncate w-full max-w-[44px] md:max-w-[52px]",
                isSelected ? "text-[#7C3AED] font-semibold" : ""
            )}>
                {label}
            </span>
        </button>
    );
}, (prev, next) => {
    return (
        prev.label === next.label &&
        prev.imageKey === next.imageKey &&
        prev.isSelected === next.isSelected &&
        prev.surcharge === next.surcharge &&
        prev.overrides === next.overrides
    );
});

interface OptionImageCardProps {
    label: string;
    subtext?: string;
    imageKey?: string;
    isSelected: boolean;
    widthClass?: string;
    heightClass?: string;
    dashed?: boolean;
    icon?: string;
    overrides?: { [key: string]: string };
    onClick: () => void;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: () => void;
    onClickMobile?: () => void;
}

const OptionImageCard = React.memo(function OptionImageCard({ 
    label, 
    subtext, 
    imageKey, 
    isSelected, 
    widthClass = "w-[90px]", 
    heightClass = "h-[110px]",
    dashed = false,
    icon,
    overrides,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onClickMobile
}: OptionImageCardProps) {
    const imgUrl = imageKey ? getOptionImage(imageKey, overrides) : '';
    
    return (
        <button
            type="button"
            onClick={() => {
                onClick();
                if (onClickMobile) onClickMobile();
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={cn(
                "group relative flex flex-col p-1.5 rounded-[12px] border-2 text-center transition-all duration-200 outline-none select-none cursor-pointer shrink-0 snap-start",
                isSelected 
                    ? "border-[#7C3AED] bg-[#F5F0FF]" 
                    : dashed 
                        ? "border-dashed border-2 border-slate-200 hover:border-[#9B5CDE]/50 hover:bg-slate-50/30"
                        : "border-gray-200 bg-white hover:border-[#9B5CDE] hover:scale-[1.03]"
            )}
            style={{ width: widthClass, height: heightClass }}
        >
            <div className={cn(
                "relative w-full rounded-lg overflow-hidden flex-1 flex items-center justify-center",
                dashed ? "bg-slate-50/50 border border-dashed border-slate-200" : "bg-gray-100"
            )} style={{ height: `calc(${heightClass} - 36px)` }}>
                {imageKey ? (
                    <ShimmerImage src={imgUrl} alt={label} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                ) : dashed ? (
                    <div className="text-slate-300 font-light text-2xl flex items-center justify-center">Ø</div>
                ) : icon ? (
                    <span className="text-2xl flex items-center justify-center">{icon}</span>
                ) : null}

                {isSelected && (
                    <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#7C3AED] flex items-center justify-center shadow-md">
                        <Check size={10} className="text-white" strokeWidth={4} />
                    </div>
                )}
            </div>
            <div className="mt-1 min-w-0 w-full">
                <span className={cn(
                    "text-[10px] font-semibold block truncate leading-tight",
                    isSelected ? "text-[#7C3AED] font-bold" : "text-slate-700"
                )}>
                    {label}
                </span>
                {subtext && (
                    <span className="text-[8px] text-slate-400 block truncate mt-0.5 leading-none">
                        {subtext}
                    </span>
                )}
            </div>
        </button>
    );
}, (prev, next) => {
    return (
        prev.label === next.label &&
        prev.subtext === next.subtext &&
        prev.imageKey === next.imageKey &&
        prev.isSelected === next.isSelected &&
        prev.widthClass === next.widthClass &&
        prev.heightClass === next.heightClass &&
        prev.dashed === next.dashed &&
        prev.icon === next.icon &&
        prev.overrides === next.overrides
    );
});

const PackageImageCard = React.memo(function PackageImageCard({ 
    title, 
    isSelected, 
    onClick 
}: { 
    title: string; 
    isSelected: boolean; 
    onClick: () => void; 
}) {
    const titleLower = title.toLowerCase();
    let imageKey = 'package_texture_matte';
    let subtext = 'Budget Friendly · Smooth matte finish';
    
    if (titleLower.includes('textured') || titleLower.includes('premium')) {
        imageKey = 'package_texture_textured';
        subtext = 'Artisanal organic textured cardstock';
    } else if (titleLower.includes('luxury') || titleLower.includes('glossy') || titleLower.includes('board') || titleLower.includes('gold') || titleLower.includes('glass')) {
        imageKey = 'package_texture_glossy';
        subtext = 'Gleaming premium metallic board';
    }
    
    const imgUrl = DEFAULT_OPTION_IMAGES[imageKey];
    
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-4 p-3 rounded-[1.5rem] border-2 text-left outline-none transition-all duration-300 select-none cursor-pointer",
                isSelected
                    ? "border-[#7C3AED] bg-[#F5F0FF] shadow-sm"
                    : "border-slate-200 bg-white hover:bg-slate-50 hover:border-[#ae7fcb]/30"
            )}
        >
            <div className="flex-1 min-w-0 pr-2">
                <p className={cn("font-bold text-sm tracking-tight leading-snug", isSelected ? "text-[#7C3AED]" : "text-slate-800")}>
                    {title}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium truncate">
                    {subtext}
                </p>
            </div>
            <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                isSelected ? "border-[#7C3AED] bg-[#7C3AED]" : "border-slate-200"
            )}>
                {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
            </div>
        </button>
    );
}, (prev, next) => {
    return (
        prev.title === next.title &&
        prev.isSelected === next.isSelected
    );
});

// ── Main ─────────────────────────────────────────────────────────────────────
export function DesignDetailClient({ design }: { design: Design }) {
    const isDigital = design.categoryId?.name === 'Digital E-Invite' || design.categoryId?.name === 'Premium E-Website';
    const isWebsite = design.categoryId?.name === 'Premium E-Website';

    const safePackages = useMemo(() => {
        if (design.packages && design.packages.length > 0) {
            // Normalize each package: if priceTiers is missing/empty but pricePerCard exists, create a default tier
            return design.packages.map((pkg: Package) => ({
                ...pkg,
                priceTiers: (pkg.priceTiers && pkg.priceTiers.length > 0)
                    ? pkg.priceTiers
                    : pkg.pricePerCard
                        ? [{ minQty: design.minQuantity || 50, maxQty: null, pricePerCard: pkg.pricePerCard! }]
                        : [],
            }));
        }
        return [{
            _id: 'default',
            title: 'Standard',
            inclusions: ["Premium Material", "Custom Printing"],
            priceTiers: [{ minQty: design.minQuantity || 50, maxQty: null, pricePerCard: design.basePrice || 0 }],
        }];
    }, [design.packages, design.basePrice, design.minQuantity]);

    const [selectedPackage, setSelectedPackage] = useState<Package>(safePackages[0]);
    const [quantity, setQuantity] = useState<number | string>(design.minQuantity || 100);
    const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
    const [isLogging, setIsLogging] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Option Selections State
    const [envelopeType, setEnvelopeType] = useState<'Landscape' | 'Portrait' | 'Pouch' | null>(null);
    const [envelopeColour, setEnvelopeColour] = useState<string | null>(null);
    const [ribbonMaterial, setRibbonMaterial] = useState<'None' | 'Satin' | 'Organza'>('None');
    const [ribbonWidth, setRibbonWidth] = useState<'6mm · Narrow' | '15mm · Medium' | '25mm · Wide' | null>(null);
    const [ribbonColour, setRibbonColour] = useState<string | null>(null);
    const [waxSeal, setWaxSeal] = useState<'None' | 'Bronze Round' | 'Gold Round' | 'Custom (enquire)'>('None');
    const [chartType, setChartType] = useState<'Single Card' | 'Tri-fold' | 'Booklet' | null>(null);
    const [activeCustomizationTab, setActiveCustomizationTab] = useState<'envelope' | 'ribbon' | 'wax_seal' | null>(null);
    const hasEnvelope = false;
    const hasRibbon = false;
    const hasWaxSeal = false;
    const hasChart = design.options?.hasChart || false;

    // Options Surcharge Overrides
    const envTierBSurcharge = design.options?.envelopeTierBSurcharge !== undefined ? design.options.envelopeTierBSurcharge : 3;
    const envTierCSurcharge = design.options?.envelopeTierCSurcharge !== undefined ? design.options.envelopeTierCSurcharge : 6;
    const ribbonPremSurcharge = design.options?.ribbonPremiumSurcharge !== undefined ? design.options.ribbonPremiumSurcharge : 2;

    const envelopeSurcharge = useMemo(() => {
        if (!hasEnvelope || !envelopeType || !envelopeColour) return 0;
        const premiumColors = ['Navy', 'Forest Green', 'Burgundy', 'Royal Blue', 'Lavender', 'Rose Gold'];
        const specialColors = ['Gold', 'Silver', 'Coral', 'Teal'];
        if (premiumColors.includes(envelopeColour)) return envTierBSurcharge;
        if (specialColors.includes(envelopeColour)) return envTierCSurcharge;
        return 0;
    }, [hasEnvelope, envelopeType, envelopeColour, envTierBSurcharge, envTierCSurcharge]);

    const ribbonSurcharge = useMemo(() => {
        if (!hasRibbon || ribbonMaterial === 'None' || !ribbonWidth || !ribbonColour) return 0;
        const premiumColors = ['Navy', 'Gold', 'Burgundy'];
        if (premiumColors.includes(ribbonColour)) return ribbonPremSurcharge;
        return 0;
    }, [hasRibbon, ribbonMaterial, ribbonWidth, ribbonColour, ribbonPremSurcharge]);

    const totalColourSurcharge = envelopeSurcharge + ribbonSurcharge;

    // Zoom/Preview Tooltip State
    const [previewItem, setPreviewItem] = useState<{
        url: string;
        label: string;
        tier?: string;
        surcharge?: string;
    } | null>(null);

    const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
    const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnterCard = (
        e: React.MouseEvent,
        item: { url: string; label: string; tier?: string; surcharge?: string }
    ) => {
        if (window.innerWidth < 768) return;
        const rect = e.currentTarget.getBoundingClientRect();
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setPreviewItem(item);
            setHoveredRect(rect);
        }, 600);
    };

    const handleMouseLeaveCard = () => {
        if (window.innerWidth < 768) return;
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setPreviewItem(null);
        setHoveredRect(null);
    };

    const handleCardClickMobile = (item: { url: string; label: string; tier?: string; surcharge?: string }) => {
        if (window.innerWidth >= 768) return;
        setPreviewItem(item);
    };

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

    const estimatedTotal = useMemo(() => {
        const q = typeof quantity === 'string' ? (parseInt(quantity) || 0) : quantity;
        const perCardBase = activeTier?.pricePerCard || 0;
        const perCardAddOns = (design.addOns || [])
            .filter(a => selectedAddOns.includes(a.label) && !a.isFixedPrice)
            .reduce((sum, a) => sum + a.pricePerCard, 0);
        const fixedAddOns = (design.addOns || [])
            .filter(a => selectedAddOns.includes(a.label) && a.isFixedPrice)
            .reduce((sum, a) => sum + a.pricePerCard, 0);
        return ((perCardBase + totalColourSurcharge + perCardAddOns) * q) + fixedAddOns;
    }, [activeTier, totalColourSurcharge, selectedAddOns, quantity, design.addOns]);

    const handleEnquire = () => {
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (data: LeadData) => {
        if (isDigital) {
            const priceVal = design.basePrice || 0;
            const pageUrl = window.location.href;
            
            try {
                await fetch('/api/inquiries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        designId: design._id,
                        designName: design.name,
                        sku: design.sku,
                        selectedPackage: isWebsite ? 'Website Access' : 'Digital Delivery',
                        quantity: 1,
                        estimatedTotal: priceVal,
                        source: 'design_page',
                        customerName: data.name,
                        phone: data.phone,
                        notes: isWebsite ? `Live Demo: ${design.demoUrl || 'N/A'}` : 'Image E-Invite'
                    })
                });
            } catch (error) {
                console.error("Inquiry logging failed", error);
                throw new Error("Failed to connect to the server.");
            }

            const message = `*Inquiry from Website (Digital Invite)*
  
Hello Zubizo,
  
My name is ${data.name}.
My contact number is ${data.phone}.
  
I'm interested in:
*Design:* ${design.name}
*SKU:* ${design.sku}
*Type:* ${isWebsite ? 'E-Website Invite' : 'Image E-Invite'}
*Link:* ${pageUrl}
${isWebsite && design.demoUrl ? `*Demo Link:* ${design.demoUrl}\n` : ''}*Price:* ₹${priceVal}
  
Please share further details.`;

            const cleanNumber = getWhatsAppNumber();
            window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
            setIsModalOpen(false);
            return;
        }

        const q = typeof quantity === 'string' ? parseInt(quantity) : quantity;

        // Build a nice option selections log for the database notes
        let optionsNotes = [];
        if (hasEnvelope && envelopeType && envelopeColour) {
            optionsNotes.push(`Envelope: ${envelopeType} - ${envelopeColour}`);
        }
        if (hasRibbon && ribbonMaterial !== 'None' && ribbonWidth && ribbonColour) {
            optionsNotes.push(`Ribbon: ${ribbonMaterial} - ${ribbonWidth.split(' · ')[0]} - ${ribbonColour}`);
        }
        if (hasWaxSeal && waxSeal !== 'None') {
            optionsNotes.push(`Wax Seal: ${waxSeal}`);
        }
        if (hasChart && chartType) {
            optionsNotes.push(`Chart Type: ${chartType}`);
        }
        const notesStr = optionsNotes.join('\n');

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
                    estimatedTotal: estimatedTotal,
                    source: 'design_page',
                    addOns: selectedAddOns,
                    customerName: data.name,
                    phone: data.phone,
                    notes: notesStr
                })
            });
        } catch (error) {
            console.error("Inquiry logging failed", error);
            throw new Error("Failed to connect to the server.");
        }

        const addOnText = selectedAddOns.length > 0
            ? `\n*Add-ons:* ${selectedAddOns.join(', ')}`
            : '';

        // Formulate options block for WhatsApp
        let envelopeStr = 'Not selected';
        if (hasEnvelope) {
            if (envelopeType && envelopeColour) {
                const tierName = envelopeSurcharge === 0 ? 'Standard' : envelopeSurcharge === envTierBSurcharge ? 'Premium' : 'Special Finish';
                const chargeStr = envelopeSurcharge > 0 ? `, +₹${envelopeSurcharge}/card` : '';
                envelopeStr = `${envelopeType} — ${envelopeColour} (${tierName}${chargeStr})`;
            } else {
                envelopeStr = 'Not selected';
            }
        } else {
            envelopeStr = 'Not selected';
        }

        let ribbonStr = 'None selected';
        if (hasRibbon) {
            if (ribbonMaterial !== 'None' && ribbonWidth && ribbonColour) {
                const tierName = ribbonSurcharge === 0 ? 'Standard' : 'Premium';
                const chargeStr = ribbonSurcharge > 0 ? `, +₹${ribbonSurcharge}/card` : '';
                ribbonStr = `${ribbonMaterial} · ${ribbonWidth.split(' · ')[0]} · ${ribbonColour} (${tierName}${chargeStr})`;
            } else {
                ribbonStr = 'None selected';
            }
        } else {
            ribbonStr = 'None selected';
        }

        let waxStr = 'None selected';
        if (hasWaxSeal) {
            if (waxSeal !== 'None') {
                waxStr = waxSeal;
            } else {
                waxStr = 'None selected';
            }
        } else {
            waxStr = 'None selected';
        }

        const cardPriceVal = (activeTier?.pricePerCard || 0) + totalColourSurcharge;
        const pageUrl = window.location.href;
        
        const message = `*Inquiry from Website*
  
Hello Zubizo,
  
My name is ${data.name}.
My contact number is ${data.phone}.
  
I'm interested in:
*Design:* ${design.name}
*SKU:* ${design.sku}
*Link:* ${pageUrl}
*Package:* ${selectedPackage.title}
*Envelope:* ${envelopeStr}
*Ribbon:* ${ribbonStr}
*Wax Seal:* ${waxStr}
*Quantity:* ${q} cards
*Price Per Card:* ₹${cardPriceVal} (for ${q} cards${totalColourSurcharge > 0 ? ', incl. colour surcharge' : ''})${addOnText}
  
Please share further details.`;

        const cleanNumber = getWhatsAppNumber();
        window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
        setIsModalOpen(false);
    };

    return (
        isDigital ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                {/* Left: Gallery */}
                <div className="lg:col-span-7 space-y-12">
                    <ImageGallery images={design.images} name={design.name} />

                    <div className="space-y-6 lg:hidden">
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-1.5 bg-[#EDE8F6] text-[#6E4B8B] text-[11px] font-bold uppercase tracking-[0.2em] rounded-full border border-[#ae7fcb]/15 shadow-sm">
                                {design.sku}
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            <span className="text-slate-500 text-[11px] font-bold tracking-wider">
                                {isWebsite ? 'E-Website Invite' : 'Image E-Invite'}
                            </span>
                        </div>

                        <h1 className="!text-2xl md:!text-3xl font-bold text-black font-italiana tracking-tight leading-[1.2]">
                            {design.name}
                        </h1>

                        <div className="w-20 h-1 bg-[#ae7fcb]/30 rounded-full" />

                        <p className="text-slate-550 text-base leading-relaxed font-light max-w-2xl">
                            {design.description || (isWebsite 
                                ? "An interactive, mobile-first wedding website featuring RSVP management, event details, maps, and photo gallery."
                                : "A premium, high-resolution digital invitation suite perfect for WhatsApp and email sharing.")}
                        </p>
                    </div>
                </div>

                {/* Right: Info + CTA */}
                <div className="lg:col-span-5 lg:sticky lg:top-28">
                    <div className="bg-white rounded-[2.5rem] shadow-luxury border border-[#ae7fcb]/10 floating-card p-8 space-y-8">
                        {/* Desktop Title & Details */}
                        <div className="hidden lg:block space-y-4 pb-6 border-b border-[#ae7fcb]/10">
                            <div className="flex items-center gap-3">
                                <span className="px-4 py-1.5 bg-[#EDE8F6] text-[#6E4B8B] text-[11px] font-bold uppercase tracking-[0.2em] rounded-full border border-[#ae7fcb]/15 shadow-sm">
                                    {design.sku}
                                </span>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <span className="text-slate-500 text-[11px] font-bold tracking-wider">
                                    {isWebsite ? 'E-Website Invite' : 'Image E-Invite'}
                                </span>
                            </div>

                            <h1 className="!text-2xl lg:!text-3xl font-bold text-black font-italiana tracking-tight leading-[1.2]">
                                {design.name}
                            </h1>

                            <div className="w-16 h-0.5 bg-[#ae7fcb]/30 rounded-full" />

                            <p className="text-slate-550 text-sm leading-relaxed font-light">
                                {design.description || (isWebsite 
                                    ? "An interactive, mobile-first wedding website featuring RSVP management, event details, maps, and photo gallery."
                                    : "A premium, high-resolution digital invitation suite perfect for WhatsApp and email sharing.")}
                            </p>
                        </div>

                        {/* Flat Pricing Section */}
                        <div className="p-6 bg-[#FAF8F5] rounded-[1.5rem] border border-[#ae7fcb]/10 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Price</span>
                                <span className="text-3xl font-bold text-[#ae7fcb]">₹{design.basePrice || 0}</span>
                            </div>
                            <div className="text-right">
                                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase tracking-wider border border-green-150">
                                    Fixed Price
                                </span>
                            </div>
                        </div>

                        {/* E-Website Features or E-Invite Deliverables */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                {isWebsite ? 'Interactive Features Included' : 'Digital Deliverables'}
                            </h3>
                            <ul className="space-y-2.5">
                                {(isWebsite ? [
                                    "RSVP Guest Management System",
                                    "Google Maps Navigation Integration",
                                    "Custom Love Story Timeline",
                                    "Photo Gallery Showcase",
                                    "Countdown to Wedding Timer",
                                    "Background Music Integration"
                                ] : [
                                    "High-Resolution JPEG, PNG & PDF Formats",
                                    "Custom text additions & color adjustments",
                                    "Unlimited WhatsApp/Email sharing"
                                ]).map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                        <Check size={16} className="text-[#ae7fcb] shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Live Demo Link (for E-Websites) */}
                        {isWebsite && design.demoUrl && (
                            <div className="pt-2">
                                <a
                                    href={design.demoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full h-14 bg-lavender/5 text-lavender border-2 border-lavender/25 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-lavender hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    View Live Website
                                    <ArrowRight size={16} />
                                </a>
                            </div>
                        )}

                        {/* Primary WhatsApp CTA */}
                        <div className="pt-2">
                            <button
                                onClick={handleEnquire}
                                className="w-full h-14 bg-charcoal hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-charcoal/20 transition-all flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={18} />
                                Enquire via WhatsApp
                            </button>
                        </div>
                    </div>
                </div>

                <LeadCaptureModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleModalSubmit}
                />
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Left: Gallery + Description */}
            <div className="lg:col-span-7 space-y-12">
                <ImageGallery images={design.images} name={design.name} />



                <div className="space-y-6 lg:hidden">
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 bg-[#EDE8F6] text-[#6E4B8B] text-[11px] font-bold uppercase tracking-[0.2em] rounded-full border border-[#ae7fcb]/15 shadow-sm">
                            {design.sku}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-slate-500 text-[11px] font-bold tracking-wider">
                            {design.categoryId?.name || 'Wedding Collection'}
                        </span>
                    </div>

                    <h1 className="!text-2xl md:!text-3xl font-bold text-black font-italiana tracking-tight leading-[1.2]">
                        {design.name}
                    </h1>

                    <div className="w-20 h-1 bg-[#ae7fcb]/30 rounded-full" />

                    <p className="text-slate-500 text-base leading-relaxed font-light max-w-2xl">
                        {design.description || "An exquisite stationery masterwork designed for life's most cherished moments."}
                    </p>
                </div>
            </div>

            {/* Right: Configuration Panel */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
                <div className="bg-white rounded-[2.5rem] shadow-luxury border border-[#ae7fcb]/10 floating-card flex flex-col lg:h-[calc(100vh-160px)] lg:max-h-[820px]">
                    {/* Scrollable Container */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 min-h-0 custom-scrollbar">
                    {/* Desktop-only Title and Details */}
                    <div className="hidden lg:block space-y-4 pb-6 border-b border-[#ae7fcb]/10">
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-1.5 bg-[#EDE8F6] text-[#6E4B8B] text-[11px] font-bold uppercase tracking-[0.2em] rounded-full border border-[#ae7fcb]/15 shadow-sm">
                                {design.sku}
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            <span className="text-slate-500 text-[11px] font-bold tracking-wider">
                                {design.categoryId?.name || 'Wedding Collection'}
                            </span>
                        </div>

                        <h1 className="!text-2xl lg:!text-3xl font-bold text-black font-italiana tracking-tight leading-[1.2]">
                            {design.name}
                        </h1>

                        <div className="w-16 h-0.5 bg-[#ae7fcb]/30 rounded-full" />

                        <p className="text-slate-500 text-sm leading-relaxed font-light">
                            {design.description || "An exquisite stationery masterwork designed for life's most cherished moments."}
                        </p>
                    </div>

                    {/* Package Display / Selection */}
                    {safePackages.length === 1 ? (
                        <div>
                            <div className="text-[11px] font-bold text-slate-500 tracking-wider mb-3">Package</div>
                            <PackageImageCard
                                title={safePackages[0].title}
                                isSelected={true}
                                onClick={() => {}}
                            />
                        </div>
                    ) : safePackages.length > 1 ? (
                        <div>
                            <h2 className="text-lg font-bold text-black font-italiana mb-4">Choose Package</h2>
                            <div className="grid grid-cols-1 gap-3">
                                {safePackages.map((pkg) => (
                                    <PackageImageCard
                                        key={pkg._id}
                                        title={pkg.title}
                                        isSelected={selectedPackage._id === pkg._id}
                                        onClick={() => setSelectedPackage(pkg)}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* Inclusions */}
                    {selectedPackage.inclusions && selectedPackage.inclusions.length > 0 && (
                        <div className="space-y-3">
                            <div className="text-[11px] font-bold text-slate-500 tracking-wider">What's Included</div>
                            <div className="space-y-2">
                                {selectedPackage.inclusions.map((inc, i) => (
                                    <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600 font-light">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#ae7fcb] shrink-0" />
                                        {inc}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Display Model Info Banner */}
                    {design.options?.displayModelColours && (
                        <div className="bg-[#FFFBEB] border border-[#FCD34D] rounded-lg p-3 flex items-start gap-2.5 text-[11px] text-[#92400E] leading-relaxed">
                            <Info size={16} className="text-[#92400E] shrink-0 mt-0.5 animate-pulse" />
                            <div>
                                The display model uses <span className="font-bold">{design.options.displayModelColours}</span>. Changing colours may affect the price per card. Surcharges are shown below.
                            </div>
                        </div>
                    )}

                    {/* Price Tiers */}
                    {selectedPackage.priceTiers && selectedPackage.priceTiers.length > 0 && (
                        <div className="space-y-3">
                            <div className="text-[11px] font-bold text-slate-500 tracking-wider">Price per card</div>
                            <div className="rounded-[1.5rem] border border-gray-100 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/80 text-gray-400 text-[10px] tracking-wider font-bold">
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
                                                        isActive ? "bg-[#EDE8F6]/20" : "bg-white hover:bg-gray-50/50"
                                                    )}
                                                >
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {isActive && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#ae7fcb] inline-block shrink-0" />
                                                            )}
                                                            <span className={cn("font-bold", isActive ? "text-slate-800" : "text-gray-500")}>
                                                                {formatTierLabel(tier, idx, selectedPackage.priceTiers)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <span className={cn("font-black", isActive ? "text-[#6E4B8B] text-base" : "text-gray-500")}>
                                                            ₹{tier.pricePerCard + totalColourSurcharge}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {totalColourSurcharge > 0 && (
                                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                                    {envelopeSurcharge > 0 && (
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400 font-medium">{envelopeColour} ({envelopeSurcharge === envTierBSurcharge ? 'Premium' : 'Special finish'}) envelope surcharge</span>
                                            <span className="text-[#6E4B8B] font-bold">+₹{envelopeSurcharge} / card</span>
                                        </div>
                                    )}
                                    {ribbonSurcharge > 0 && (
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400 font-medium">Premium ribbon colour surcharge</span>
                                            <span className="text-[#6E4B8B] font-bold">+₹{ribbonSurcharge} / card</span>
                                        </div>
                                    )}
                                    <p className="text-[10px] italic text-slate-400 pt-1">Prices shown include colour surcharges</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Format Selector */}
                    {hasChart && (
                        <div className="space-y-3">
                            <div className="text-[11px] font-bold text-slate-500 tracking-wider">Format</div>
                            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-8 px-8 md:mx-0 md:px-0 md:flex-wrap md:pb-0">
                                {['Single Card', 'Tri-fold', 'Booklet'].map((type) => {
                                    const key = `chart_${type.toLowerCase().replace('-', '_').replace(' ', '_')}`;
                                    const isSelected = chartType === type;
                                    const overrides = design.options?.images;
                                    return (
                                        <OptionImageCard
                                            key={type}
                                            label={type}
                                            imageKey={key}
                                            isSelected={isSelected}
                                            overrides={overrides}
                                            onClick={() => setChartType(type as any)}
                                            onMouseEnter={(e) => handleMouseEnterCard(e, { url: getOptionImage(key, overrides), label: type })}
                                            onMouseLeave={handleMouseLeaveCard}
                                            onClickMobile={() => handleCardClickMobile({ url: getOptionImage(key, overrides), label: type })}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Selected Options Summary Panel */}
                    {hasChart && chartType && (
                        <div className="bg-[#F8F4FF] border border-[#DDD6FE] rounded-xl p-4 space-y-2.5 text-xs text-slate-755">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 font-medium">
                                    <span className="text-[14px]">📄</span> Card finish
                                </span>
                                <span className="font-bold text-slate-800">{selectedPackage.title}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 font-medium">
                                    <span className="text-[14px]">✦</span> Format
                                </span>
                                <span className="font-bold text-slate-800">{chartType}</span>
                            </div>
                        </div>
                    )}

                    {/* Quantity Input */}
                    <div className="space-y-3">
                        <div className="text-[11px] font-bold text-slate-500 tracking-wider">Your quantity</div>
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
                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                className={cn(
                                    "w-full h-14 pl-6 pr-20 bg-white border-2 rounded-[1rem] font-bold text-base transition-all outline-none placeholder:font-medium placeholder:text-gray-400",
                                    isInvalidQuantity
                                        ? "border-red-200 bg-red-50/50 text-red-600 focus:border-red-400"
                                        : "border-gray-100 text-slate-800 focus:border-[#ae7fcb]"
                                )}
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-wider text-neutral-400">cards</span>
                        </div>
                        {isInvalidQuantity && (
                            <p className="text-[10px] font-bold text-red-500 tracking-wider">
                                Minimum order is {design.minQuantity || 50} cards
                            </p>
                        )}
                    </div>

                    {/* Add-ons */}
                    {addOns.length > 0 && (
                        <div className="space-y-3">
                            <div className="text-[11px] font-bold text-slate-500 tracking-wider">Optional add-ons</div>
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
                                                    ? "border-[#ae7fcb] bg-[#EDE8F6]/20"
                                                    : "border-gray-100 hover:border-[#ae7fcb]/30 hover:bg-gray-50/50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                                                    isSelected ? "border-[#ae7fcb] bg-[#ae7fcb]" : "border-gray-200"
                                                )}>
                                                    {isSelected && <Check size={12} className="text-white" />}
                                                </div>
                                                <span className={cn("text-sm font-bold", isSelected ? "text-slate-800" : "text-gray-600")}>
                                                    {addOn.label}
                                                </span>
                                            </div>
                                            <span className={cn("text-sm font-bold shrink-0", isSelected ? "text-[#6E4B8B]" : "text-gray-400")}>
                                                {addOn.pricePerCard === 0
                                                    ? (addOn.note || 'Free')
                                                    : addOn.isFixedPrice 
                                                        ? `+₹${addOn.pricePerCard} (One Time)` 
                                                        : `+₹${addOn.pricePerCard}/card`}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    </div> {/* End of Scrollable Container */}

                    {/* Pinned Bottom Container */}
                    <div className="p-8 pt-4 border-t border-slate-100 bg-white rounded-b-[2.5rem] shrink-0">
                        {/* Enquire Button */}
                        <button
                            onClick={handleEnquire}
                            disabled={isLogging || isInvalidQuantity}
                            className="w-full h-14 bg-[#6E4B8B] hover:bg-[#5b3d73] text-white rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-4 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group animate-bounce-subtle"
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
                    </div>

                </div>
            </div>

            {/* Desktop Option Hover Zoom Tooltip */}
            {previewItem && hoveredRect && typeof window !== 'undefined' && window.innerWidth >= 768 && (
                <div 
                    className="fixed z-[999] w-[160px] h-[160px] bg-white rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-slate-100 overflow-hidden pointer-events-none transition-all duration-180 ease-out origin-bottom"
                    style={{
                        top: `${hoveredRect.top < 200 ? (hoveredRect.bottom + 10) : (hoveredRect.top - 170)}px`,
                        left: `${hoveredRect.left + (hoveredRect.width - 160) / 2}px`
                    }}
                >
                    <ShimmerImage src={previewItem.url} alt={previewItem.label} className="w-full h-full object-cover" />
                </div>
            )}
            
            {/* Mobile Bottom Sheet Tap Preview */}
            <AnimatePresence>
                {previewItem && typeof window !== 'undefined' && window.innerWidth < 768 && (
                    <div className="fixed inset-0 z-[999] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setPreviewItem(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 250 }}
                            className="relative w-full max-w-md bg-white rounded-t-[2rem] p-6 shadow-2xl z-10 flex flex-col items-center gap-4"
                        >
                            <div className="w-12 h-1 bg-gray-200 rounded-full mb-2" />
                            
                            <div className="w-[200px] h-[200px] rounded-2xl overflow-hidden shadow-md border border-gray-100">
                                <ShimmerImage src={previewItem.url} alt={previewItem.label} className="w-full h-full object-cover" />
                            </div>

                            <div className="text-center space-y-1.5 w-full">
                                <h4 className="text-lg font-bold text-slate-800 font-italiana">{previewItem.label}</h4>
                                {previewItem.tier && (
                                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black tracking-wider bg-purple-50 text-[#6E4B8B]">
                                        {previewItem.tier}
                                    </span>
                                )}
                                {previewItem.surcharge && (
                                    <p className="text-xs font-bold text-slate-500">{previewItem.surcharge}</p>
                                )}
                            </div>

                            <button
                                onClick={() => setPreviewItem(null)}
                                className="w-full py-3.5 bg-slate-800 text-white rounded-xl text-xs font-black tracking-wider mt-2 hover:bg-black transition-colors"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            

            
            <LeadCaptureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />
        </div>
        )
    );
}
