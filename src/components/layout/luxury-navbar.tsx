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
    const [isSearching, setIsSearching] = React.useState(false);
    const { scrollY } = useScroll();

    // Semi-transparent initially for that "glass" feel, pearl white on scroll
    const bgColor = useTransform(
        scrollY,
        [0, 50],
        ["rgba(250, 249, 251, 0.4)", "rgba(250, 249, 251, 0.85)"]
    );

    const backdropBlur = useTransform(
        scrollY,
        [0, 50],
        ["blur(12px)", "blur(12px)"]
    );

    const shadow = useTransform(
        scrollY,
        [0, 50],
        ["none", "0 4px 30px -4px rgba(0,0,0,0.05)"]
    );

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Catalogue", href: "/catalog" },
        { name: "Our Story", href: "/#about" },
        { name: "Policies", href: "/policies" },
        { name: "Contact", href: "/#contact" },
    ];

    React.useEffect(() => {
        const fetchResults = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const res = await fetch(`/api/designs?search=${searchQuery}`);
                const data = await res.json();
                if (res.ok) setSearchResults(data.slice(0, 5));
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <motion.nav
            style={{
                backgroundColor: bgColor,
                backdropFilter: backdropBlur,
                boxShadow: shadow
            }}
            className="fixed top-0 z-50 w-full transition-colors duration-500"
        >
            <div className="mx-auto max-w-[1440px] px-8 md:px-12 lg:px-20">
                <div className="flex h-24 items-center justify-between gap-12">
                    {/* Left: Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="group flex items-center gap-4">
                            <LogoIcon size={32} className="text-lavender transition-transform group-hover:scale-110 duration-500" />
                            <div className="flex flex-col leading-none">
                                <span className="text-base font-black tracking-[0.2em] uppercase text-charcoal font-serif">
                                    ZUBIZO
                                </span>
                                <span className="text-[8px] font-black tracking-[0.4em] uppercase text-lavender/60">
                                    Invitation Studio
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Center: Navigation Links */}
                    <div className="hidden lg:flex items-center space-x-12">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="font-sans text-sm font-medium uppercase tracking-[0.12em] text-charcoal/70 hover:text-lavender transition-all relative group py-2"
                            >
                                {link.name}
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-lavender/60 rounded-full transition-all duration-300 group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    {/* Right: Search + Action */}
                    <div className="hidden md:flex items-center gap-8 flex-1 max-w-md justify-end">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Find a design..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-charcoal/[0.03] border border-charcoal/5 focus:border-lavender/30 rounded-full py-3.5 px-12 text-sm font-medium text-charcoal placeholder:text-charcoal/40 transition-all outline-none"
                            />
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/20 transition-colors" />

                            {/* Search Results Dropdown */}
                            <AnimatePresence>
                                {searchQuery.length >= 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full mt-4 w-full bg-pearl-white rounded-3xl shadow-luxury border border-charcoal/5 overflow-hidden p-2"
                                    >
                                        {isSearching ? (
                                            <div className="p-8 text-center text-[10px] font-black uppercase tracking-widest text-charcoal/20">Searching...</div>
                                        ) : searchResults.length > 0 ? (
                                            <div>
                                                {searchResults.map((result) => (
                                                    <Link
                                                        key={result._id}
                                                        href={`/catalog/${result.slug}`}
                                                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-lavender/5 transition-colors group"
                                                        onClick={() => setSearchQuery("")}
                                                    >
                                                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-charcoal/5">
                                                            <img src={result.images[0]} alt={result.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="text-xs font-bold text-charcoal truncate">{result.name}</p>
                                                            <p className="text-[9px] font-black text-charcoal/30 uppercase tracking-[0.2em]">{result.sku}</p>
                                                        </div>
                                                        <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-lavender" />
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-[10px] font-black uppercase tracking-widest text-charcoal/20">No results found</div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-3 text-charcoal hover:text-lavender transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
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
                        className="lg:hidden bg-pearl-white border-b border-charcoal/5 shadow-luxury"
                    >
                        <div className="p-8 space-y-6">
                            <div className="relative">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/20" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-charcoal/[0.03] border border-charcoal/5 rounded-2xl py-4 px-12 text-sm text-charcoal outline-none shadow-inner"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
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
