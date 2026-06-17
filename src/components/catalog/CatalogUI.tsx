"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, X, ArrowUpDown, SlidersHorizontal, Check, FileText, Truck, RefreshCcw, AlertTriangle, Info, Mail, Layers, Stamp } from "lucide-react";
import { cn } from "@/lib/utils";
import DesignCard from "./DesignCard";

interface CatalogUIProps {
    initialDesigns: any[];
    categories: any[];
    activePriceFilter?: {
        maxPrice: string;
        minPrice: string;
        priceRange: string;
    };
}

function getPriceLabel(f?: { maxPrice: string; minPrice: string; priceRange: string }) {
    if (!f) return null;
    if (f.priceRange === 'under30') return 'Under ₹30';
    if (f.priceRange === 'under60') return 'Under ₹60';
    if (f.priceRange === 'under90') return 'Under ₹90';
    if (f.priceRange === 'premium') return '₹120+';
    if (f.maxPrice) return `Under ₹${f.maxPrice}`;
    if (f.minPrice) return `From ₹${f.minPrice}`;
    return null;
}

const SORT_OPTIONS = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Newest First', value: 'newest' },
];

export default function CatalogUI({ initialDesigns, categories, activePriceFilter }: CatalogUIProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [showSortMenu, setShowSortMenu] = React.useState(false);
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);

    const activeCategory = searchParams.get('category') || "All";
    const sortBy = searchParams.get('sort') || "featured";

    // Drawer temporary states
    const [tempCategory, setTempCategory] = React.useState(activeCategory);
    const [tempPriceRange, setTempPriceRange] = React.useState(activePriceFilter?.priceRange || "");

    // Sync drawer states when drawer opens
    React.useEffect(() => {
        if (isFilterOpen) {
            setTempCategory(activeCategory);
            setTempPriceRange(activePriceFilter?.priceRange || "");
        }
    }, [isFilterOpen, activeCategory, activePriceFilter]);

    const toggleSort = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', val);
        router.push(`${pathname}?${params.toString()}`);
        setShowSortMenu(false);
    };

    const setCategory = (name: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (name === "All") params.delete('category');
        else params.set('category', name);
        router.push(`${pathname}?${params.toString()}`);
    };

    const applyFilters = (filters: {
        category: string;
        priceRange: string;
    }) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (filters.category === "All") params.delete('category');
        else params.set('category', filters.category);
        
        if (filters.priceRange) params.set('priceRange', filters.priceRange);
        else params.delete('priceRange');
        
        // Remove style, occasion, color filters from URL if they exist
        params.delete('style');
        params.delete('occasion');
        params.delete('color');
        
        router.push(`${pathname}?${params.toString()}`);
        setIsFilterOpen(false);
    };

    const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Featured';
    const priceLabel = getPriceLabel(activePriceFilter);

    const clearPriceFilter = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('maxPrice');
        params.delete('minPrice');
        params.delete('priceRange');
        params.delete('price');
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="site-container py-10">
            {/* Category Pills */}
            <div className="mb-6">
                <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
                    {['All', ...categories.map(c => c.name)].map(cat => {
                        const isActive = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={cn(
                                    "relative isolate whitespace-nowrap px-6 h-10 rounded-full text-xs font-bold uppercase tracking-wider border transition-all shrink-0 cursor-pointer shadow-sm outline-none",
                                    isActive
                                        ? "text-white border-[#6E4B8B] bg-transparent"
                                        : "bg-white text-neutral-600 border-slate-200 hover:border-[#ae7fcb]/40 hover:text-[#ae7fcb] hover:scale-[1.02] active:scale-[0.98]"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeCatalogCategoryTab"
                                        className="absolute inset-0 bg-[#6E4B8B] rounded-full"
                                        style={{ zIndex: -1 }}
                                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                    />
                                )}
                                <span className="relative z-10">{cat}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Customization Options Circles */}
            <div className="mb-10 flex flex-col items-center">
                <h3 className="text-sm font-italiana text-[#8aa3be] mb-6 text-center tracking-widest uppercase">Customization Options</h3>
                <div className="flex items-center justify-center gap-8 overflow-x-auto pb-4 scrollbar-hide w-full">
                    <Link href="/options/envelopes" target="_blank" className="flex flex-col items-center gap-3 group shrink-0">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200 group-hover:border-[#ae7fcb] transition-all shadow-sm">
                            <img src="/envelope-icon.jpg.png" alt="Envelopes" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 group-hover:text-[#6E4B8B]">Envelopes</span>
                    </Link>
                    <Link href="/options/chart-sheets" target="_blank" className="flex flex-col items-center gap-3 group shrink-0">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200 group-hover:border-[#ae7fcb] transition-all shadow-sm">
                            <img src="/chart-sheets-icon.jpg.png" alt="Chart Sheets" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 group-hover:text-[#6E4B8B]">Chart Sheets</span>
                    </Link>
                    <Link href="/options/wax-seals" target="_blank" className="flex flex-col items-center gap-3 group shrink-0">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200 group-hover:border-[#ae7fcb] transition-all shadow-sm">
                            <img src="/wax-seal-icon.jpg.png" alt="Wax Seal" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 group-hover:text-[#6E4B8B]">Wax Seal</span>
                    </Link>
                </div>
            </div>

            {/* Filter & Sort Controls Row */}
            <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-[#ae7fcb]/10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 px-5 h-10 bg-white border border-slate-200 hover:border-[#ae7fcb]/45 rounded-full text-xs font-bold text-slate-700 hover:text-[#ae7fcb] transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <SlidersHorizontal size={14} className="text-[#6E4B8B]" />
                        <span>Filter ⊞</span>
                        {(activePriceFilter?.priceRange) && (
                            <span className="w-2 h-2 rounded-full bg-[#6E4B8B]" />
                        )}
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowSortMenu(v => !v)}
                            className="flex items-center gap-2 px-5 h-10 bg-white border border-slate-200 hover:border-[#ae7fcb]/45 rounded-full text-xs font-bold text-slate-700 hover:text-[#ae7fcb] transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <ArrowUpDown size={14} className="text-[#6E4B8B]" />
                            <span>Sort: {activeSortLabel} ▼</span>
                        </button>
                        <AnimatePresence>
                            {showSortMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    className="absolute left-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden z-30"
                                >
                                    {SORT_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => toggleSort(opt.value)}
                                            className={cn("w-full text-left px-5 py-3.5 text-[10px] hover:bg-gray-50 transition-colors font-bold uppercase tracking-wider",
                                                sortBy === opt.value ? "text-[#6E4B8B] bg-[#6E4B8B]/5" : "text-slate-600"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {initialDesigns.length} designs
                </div>
            </div>

            {/* Active filters badges */}
            {priceLabel && (
                <div className="flex flex-wrap items-center gap-2 mb-8">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Filters:</span>
                    <span className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-[#6E4B8B]/10 text-[#6E4B8B] text-[10px] font-bold border border-[#ae7fcb]/20">
                        {priceLabel}
                        <button onClick={clearPriceFilter} className="hover:opacity-60 transition-opacity cursor-pointer">
                            <X size={10} />
                        </button>
                    </span>
                </div>
            )}

            {/* Grid */}
            <AnimatePresence mode="wait">
                {initialDesigns.length > 0 ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                    >
                        {initialDesigns.map((design, i) => (
                            <motion.div
                                key={design._id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.05 }}
                                transition={{ duration: 0.45, delay: Math.min((i % 4) * 0.05, 0.2) }}
                            >
                                <DesignCard design={design} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-32 text-center"
                    >
                        <p className="text-2xl font-bold text-gray-205 font-serif italic mb-3">No designs found</p>
                        <p className="text-sm text-gray-400 mb-6">Try a different filter or search term.</p>
                        <button
                            onClick={() => {
                                router.push(pathname);
                            }}
                            className="px-6 h-10 bg-[#6E4B8B] hover:bg-[#5D3F76] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        >
                            Reset Explore
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filter Drawer */}
            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 cursor-pointer"
                            onClick={() => setIsFilterOpen(false)}
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
                            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-[#FAF8F5] shadow-2xl z-[60] flex flex-col justify-between"
                        >
                            {/* Header */}
                            <div className="p-6 md:p-8 border-b border-[#ae7fcb]/10 flex items-center justify-between shrink-0 bg-white">
                                <h3 className="text-xl font-normal text-slate-800 font-italiana">Filters</h3>
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                                {/* Category Section */}
                                <div className="space-y-3">
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Category</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['All', ...categories.map(c => c.name)].map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setTempCategory(cat)}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                                                    tempCategory === cat
                                                        ? "bg-[#6E4B8B] text-white border-[#6E4B8B]"
                                                        : "bg-white text-slate-655 border-slate-200 hover:border-[#ae7fcb]/40 hover:text-[#ae7fcb]"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range Section */}
                                <div className="space-y-3">
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Price Range</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: "Under ₹30", value: "under30" },
                                            { label: "Under ₹60", value: "under60" },
                                            { label: "Under ₹90", value: "under90" },
                                            { label: "Premium (₹120+)", value: "premium" },
                                        ].map(slab => (
                                            <button
                                                key={slab.value}
                                                type="button"
                                                onClick={() => setTempPriceRange(tempPriceRange === slab.value ? "" : slab.value)}
                                                className={cn(
                                                    "px-4 py-3 rounded-2xl text-xs font-semibold border transition-all cursor-pointer text-left flex items-center justify-between",
                                                    tempPriceRange === slab.value
                                                        ? "bg-[#6E4B8B]/5 text-[#6E4B8B] border-[#6E4B8B]"
                                                        : "bg-white text-slate-600 border-slate-200 hover:border-[#ae7fcb]/30"
                                                )}
                                            >
                                                <span>{slab.label}</span>
                                                {tempPriceRange === slab.value && <Check size={14} className="text-[#6E4B8B]" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer */}
                            <div className="p-6 md:p-8 border-t border-[#ae7fcb]/10 bg-white shrink-0 flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTempCategory("All");
                                        setTempPriceRange("");
                                        applyFilters({ category: "All", priceRange: "" });
                                    }}
                                    className="flex-1 h-12 rounded-2xl border border-slate-200 text-slate-750 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyFilters({
                                        category: tempCategory,
                                        priceRange: tempPriceRange
                                    })}
                                    className="flex-1 h-12 rounded-2xl bg-[#6E4B8B] hover:bg-[#5D3F76] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Apply
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
