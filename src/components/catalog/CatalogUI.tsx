"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, ChevronDown, Grid3X3, List, X, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import DesignCard from "./DesignCard";

interface CatalogUIProps {
    initialDesigns: any[];
    categories: any[];
}

const SORT_OPTIONS = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Newest First', value: 'newest' },
];

export default function CatalogUI({ initialDesigns, categories }: CatalogUIProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [showSortMenu, setShowSortMenu] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
    const [localSearch, setLocalSearch] = React.useState(searchParams.get('search') || "");

    const activeCategory = searchParams.get('category') || "All";
    const sortBy = searchParams.get('sort') || "featured";

    // Handle Search with debounce or manual trigger
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (localSearch) params.set('search', localSearch);
        else params.delete('search');
        router.push(`${pathname}?${params.toString()}`);
    };

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

    const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Featured';

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            {/* Sort + View controls & Category Pills Row */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Category Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['All', ...categories.map(c => c.name)].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={cn(
                                    "whitespace-nowrap px-4 h-9 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all shrink-0",
                                    activeCategory === cat
                                        ? "bg-lavender text-white border-lavender shadow-md shadow-lavender/20"
                                        : "bg-white text-neutral-500 border-neutral-200 hover:border-lavender/40 hover:text-lavender"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 self-end">
                        {/* Sort dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortMenu(v => !v)}
                                className="flex items-center gap-2 px-4 h-10 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:border-lavender/40 transition-colors shadow-sm"
                            >
                                <ArrowUpDown size={14} className="text-lavender" />
                                {activeSortLabel}
                                <ChevronDown size={14} className={cn("text-neutral-400 transition-transform", showSortMenu && "rotate-180")} />
                            </button>
                            <AnimatePresence>
                                {showSortMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-premium border border-neutral-100 overflow-hidden z-30"
                                    >
                                        {SORT_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => toggleSort(opt.value)}
                                                className={cn("w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors font-medium",
                                                    sortBy === opt.value ? "text-lavender font-bold" : "text-charcoal"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* View mode */}
                        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white text-lavender shadow-sm" : "text-gray-400")}>
                                <Grid3X3 size={16} />
                            </button>
                            <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white text-lavender shadow-sm" : "text-gray-400")}>
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="relative mb-8 max-w-md group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-lavender transition-colors" />
                    <input
                        type="text"
                        placeholder="Search designs..."
                        value={localSearch}
                        onChange={e => setLocalSearch(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 bg-white border border-neutral-200 rounded-lg text-sm font-medium focus:border-lavender outline-none shadow-sm transition-all"
                    />
                    {localSearch && (
                        <button type="button" onClick={() => { setLocalSearch(''); router.push(pathname); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    )}
                </form>
            </div>

            {/* Grid / List */}
            <AnimatePresence mode="wait">
                {initialDesigns.length > 0 ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                            "gap-6",
                            viewMode === 'grid'
                                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        )}
                    >
                        {initialDesigns.map((design, i) => (
                            <motion.div
                                key={design._id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.05, 0.4) }}
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
                        <p className="text-2xl font-bold text-gray-200 font-serif italic mb-3">No designs found</p>
                        <p className="text-sm text-gray-400 mb-6">Try a different filter or search term.</p>
                        <button
                            onClick={() => router.push(pathname)}
                            className="px-6 h-10 bg-lavender text-white rounded-lg text-sm font-medium hover:bg-lavender/90 transition-colors tracking-wide"
                        >
                            Reset Explore
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
