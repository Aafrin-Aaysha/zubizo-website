"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSystemProps {
    onFilterChange: (filters: {
        category: string;
        priceRange: [number, number];
        sizes: string[];
        themes: string[];
    }) => void;
    activeCategory: string;
    categories: string[];
    themes: string[];
}

const SIZES = ["A5 Standard", "Square (6x6)", "Pocket Fold"];

const FilterSystem = ({ onFilterChange, activeCategory, categories, themes }: FilterSystemProps) => {
    const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 250]);
    const [selectedSizes, setSelectedSizes] = React.useState<string[]>([]);
    const [selectedThemes, setSelectedThemes] = React.useState<string[]>([]);

    const handleSizeToggle = (size: string) => {
        const next = selectedSizes.includes(size)
            ? selectedSizes.filter(s => s !== size)
            : [...selectedSizes, size];
        setSelectedSizes(next);
        onFilterChange({ category: activeCategory, priceRange, sizes: next, themes: selectedThemes });
    };

    const handleThemeToggle = (theme: string) => {
        const next = selectedThemes.includes(theme)
            ? selectedThemes.filter(t => t !== theme)
            : [...selectedThemes, theme];
        setSelectedThemes(next);
        onFilterChange({ category: activeCategory, priceRange, sizes: selectedSizes, themes: next });
    };

    const handlePriceChange = (value: number) => {
        const next: [number, number] = [0, value];
        setPriceRange(next);
        onFilterChange({ category: activeCategory, priceRange: next, sizes: selectedSizes, themes: selectedThemes });
    };

    return (
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-12">
            {/* Collections */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 font-sans">
                    Collections
                </h3>
                <ul className="space-y-3">
                    {categories.map((cat) => (
                        <li key={cat}>
                            <button
                                onClick={() => onFilterChange({ category: cat, priceRange, sizes: selectedSizes, themes: selectedThemes })}
                                className={cn(
                                    "group flex items-center justify-between w-full text-sm font-bold transition-all",
                                    activeCategory === cat ? "text-lavender" : "text-charcoal hover:text-lavender"
                                )}
                            >
                                <div className="flex items-center">
                                    <div className={cn(
                                        "mr-3 h-1.5 w-1.5 rounded-full transition-all",
                                        activeCategory === cat ? "bg-lavender scale-150" : "bg-charcoal/20 group-hover:bg-lavender"
                                    )} />
                                    {cat}
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-charcoal/40 mb-6 font-sans">
                    Price Range
                </h3>
                <div className="px-2">
                    <input
                        type="range"
                        min="0"
                        max="250"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange(parseInt(e.target.value))}
                        className="w-full h-1 bg-soft-grey rounded-lg appearance-none cursor-pointer accent-lavender"
                    />
                    <div className="mt-4 flex items-center justify-between text-xs font-bold text-charcoal/60">
                        <span>$0</span>
                        <span>${priceRange[1]}+</span>
                    </div>
                </div>
            </div>

            {/* Card Size */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-charcoal/40 mb-6 font-sans">
                    Card Size
                </h3>
                <ul className="space-y-4">
                    {SIZES.map((size) => (
                        <li key={size}>
                            <label className="group flex items-center cursor-pointer">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={selectedSizes.includes(size)}
                                        onChange={() => handleSizeToggle(size)}
                                    />
                                    <div className={cn(
                                        "h-5 w-5 rounded border-2 transition-all flex items-center justify-center",
                                        selectedSizes.includes(size) ? "bg-lavender border-lavender" : "bg-white border-soft-grey group-hover:border-lavender"
                                    )}>
                                        {selectedSizes.includes(size) && <Check className="h-3 w-3 text-white" />}
                                    </div>
                                </div>
                                <span className={cn(
                                    "ml-3 text-sm font-bold transition-colors",
                                    selectedSizes.includes(size) ? "text-charcoal" : "text-charcoal/60 group-hover:text-charcoal"
                                )}>
                                    {size}
                                </span>
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Theme Tags */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-charcoal/40 mb-6 font-sans">
                    Theme
                </h3>
                <div className="flex flex-wrap gap-2">
                    {themes.map((theme) => (
                        <button
                            key={theme}
                            onClick={() => handleThemeToggle(theme)}
                            className={cn(
                                "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                                selectedThemes.includes(theme)
                                    ? "bg-lavender text-white shadow-lg shadow-lavender/20"
                                    : "bg-soft-grey text-charcoal/60 hover:bg-soft-grey/80"
                            )}
                        >
                            {theme}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export { FilterSystem };
