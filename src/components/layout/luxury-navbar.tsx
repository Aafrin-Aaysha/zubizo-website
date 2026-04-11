"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Search, Menu, X, ArrowRight } from "lucide-react";
import { LogoIcon } from "@/components/ui/logo-icon";
import { cn } from "@/lib/utils";

export const LuxuryNavbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [searchResults, setSearchResults] = React.useState<any[]>([]);
    const [popularDesigns, setPopularDesigns] = React.useState<any[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [showDesktopResults, setShowDesktopResults] = React.useState(false);
    const { scrollY } = useScroll();

    // Fetch popular designs on mount
    React.useEffect(() => {
        const fetchPopular = async () => {
            try {
                const res = await fetch('/api/designs?isTrending=true&limit=6');
                const data = await res.json();
                if (res.ok) {
                    setPopularDesigns(data);
                    setSearchResults(data);
                }
            } catch (error) {
                console.error("Failed to fetch popular designs", error);
            }
        };
        fetchPopular();
    }, []);

    React.useEffect(() => {
        const fetchResults = async () => {
            if (searchQuery.length === 0) {
                setSearchResults(popularDesigns);
                setIsSearching(false);
                return;
            }

            if (searchQuery.length < 2) return;

            setIsSearching(true);
            try {
                const res = await fetch(`/api/designs?search=${searchQuery}`);
                const data = await res.json();
                if (res.ok) setSearchResults(data.slice(0, 6));
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, popularDesigns]);

    const bgColor = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.8)"]);
    const backdropBlur = useTransform(scrollY, [0, 50], ["blur(0px)", "blur(12px)"]);
    const shadow = useTransform(scrollY, [0, 50], ["none", "0 4px 30px -4px rgba(0,0,0,0.05)"]);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Catalogue", href: "/catalog" },
        { name: "Digital Invites", href: "/digital-invites" },
        { name: "Our Story", href: "/#about" },
        { name: "Policies", href: "/policies" },
        { name: "Contact", href: "/#contact" },
    ];

    const renderSearchResults = (onItemClick?: () => void) => (
        <div className="py-2 max-h-[60vh] overflow-y-auto scrollbar-hide">
            {isSearching ? (
                <div className="p-8 text-center">
                    <div className="inline-block w-4 h-4 border-2 border-lavender/30 border-t-lavender rounded-full animate-spin mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/20">Searching...</p>
                </div>
            ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                    {searchQuery.length === 0 && (
                        <div className="px-4 py-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-lavender/60">Popular Designs</h4>
                        </div>
                    )}
                    {searchResults.map((result) => (
                        <Link
                            key={result._id}
                            href={`/catalog/${result.slug}`}
                            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-lavender/5 transition-colors group"
                            onClick={() => {
                                setSearchQuery("");
                                if (onItemClick) onItemClick();
                            }}
                        >
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-charcoal/5">
                                <img src={result.images[0]} alt={result.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[13px] font-bold text-charcoal truncate group-hover:text-lavender transition-colors">{result.name}</p>
                                <p className="text-[10px] font-medium text-charcoal/40 uppercase tracking-wider">{result.sku}</p>
                            </div>
                            <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-lavender" />
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center text-charcoal/20">
                    <p className="text-[10px] font-black uppercase tracking-widest ">No results found</p>
                </div>
            )}
        </div>
    );

    return (
        <motion.nav
            style={{
                backgroundColor: bgColor,
                backdropFilter: backdropBlur,
                boxShadow: shadow
            }}
            className="fixed top-0 z-50 w-full transition-colors duration-500"
        >
            <div className="site-container">
                <div className="flex h-24 items-center px-4 lg:px-0">
                    {/* 1. Brand Group (Desktop: Logo + Nav | Mobile: Icon Only) */}
                    <div className="flex-1 lg:flex-none flex items-center justify-start gap-12">
                        {/* Mobile Logo Icon */}
                        <Link href="/" className="lg:hidden">
                            <LogoIcon size={32} className="text-lavender" />
                        </Link>

                        {/* Desktop Logo (Icon + Text) */}
                        <Link href="/" className="hidden lg:flex items-center gap-4 group">
                            <LogoIcon size={40} className="text-lavender transition-transform group-hover:scale-110 duration-500" />
                            <div className="flex flex-col leading-none pt-1">
                                <span className="text-[28px] text-lavender font-extrabold italic" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                                    Zubizo
                                </span>
                            </div>
                        </Link>

                        {/* Navigation Links (Desktop Only) */}
                        <div className="hidden xl:flex items-center space-x-10">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="font-sans text-[13px] font-medium uppercase tracking-[0.12em] text-charcoal/70 hover:text-lavender transition-all relative group py-2"
                                >
                                    {link.name}
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-lavender/60 rounded-full transition-all duration-300 group-hover:w-full" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 2. Center Brand (Mobile Only) */}
                    <div className="flex-[2] lg:hidden flex justify-center">
                        <Link href="/" className="pt-1">
                            <span className="text-[26px] text-lavender font-extrabold italic" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                                Zubizo
                            </span>
                        </Link>
                    </div>

                    {/* 3. Global Actions (Search Desktop / Menu Mobile) */}
                    <div className="flex-1 flex items-center justify-end lg:ml-32 gap-4 min-w-[32px] lg:min-w-[320px]">
                        {/* Search (Desktop Only) */}
                        <div className="hidden lg:flex items-center gap-4 flex-1 justify-end">
                            <div className="relative w-full max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search by design name or SKU..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowDesktopResults(true)}
                                    onBlur={() => setTimeout(() => setShowDesktopResults(false), 200)}
                                    className="w-full bg-charcoal/[0.03] border border-charcoal/5 focus:border-lavender/30 rounded-full py-3 px-10 text-[13px] font-medium text-charcoal placeholder:text-charcoal/40 transition-all outline-none"
                                />
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/20 transition-colors" />

                                {/* Search Results Dropdown */}
                                <AnimatePresence>
                                    {showDesktopResults && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full mt-4 w-full bg-pearl-white rounded-3xl shadow-luxury border border-charcoal/5 overflow-hidden p-2 z-50"
                                        >
                                            {renderSearchResults(() => setShowDesktopResults(false))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden text-lavender">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-3 hover:text-lavender/70 transition-colors"
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden bg-pearl-white border-b border-charcoal/5 shadow-luxury max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 space-y-6">
                            <div className="relative">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/20" />
                                <input
                                    type="text"
                                    placeholder="Search by design name or SKU..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-charcoal/[0.03] border border-charcoal/5 rounded-2xl py-4 px-12 text-sm text-charcoal outline-none shadow-inner"
                                />
                                
                                {/* Mobile Search Results Dropdown */}
                                <AnimatePresence>
                                    {searchQuery.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 bg-white/50 rounded-2xl overflow-hidden border border-charcoal/5"
                                        >
                                            {renderSearchResults(() => setIsOpen(false))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Show popular designs in mobile menu even when search is empty */}
                            {!searchQuery && (
                                <div className="space-y-4">
                                    <div className="px-2">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-lavender/60">Popular Designs</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {popularDesigns.slice(0, 4).map((design) => (
                                            <Link
                                                key={design._id}
                                                href={`/catalog/${design.slug}`}
                                                onClick={() => setIsOpen(false)}
                                                className="group block"
                                            >
                                                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-charcoal/5 mb-2 relative">
                                                    <img src={design.images[0]} alt={design.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                </div>
                                                <p className="text-[11px] font-bold text-charcoal truncate">{design.name}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-2 pt-4 border-t border-charcoal/5">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="block py-4 px-6 text-sm font-semibold uppercase tracking-[0.1em] text-charcoal/70 hover:text-lavender hover:bg-lavender/5 rounded-2xl transition-all"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};
