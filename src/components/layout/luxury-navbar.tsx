"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X } from "lucide-react";
import { LogoIcon } from "@/components/ui/logo-icon";
import { cn } from "@/lib/utils";

export const LuxuryNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [searchResults, setSearchResults] = React.useState<any[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [showResultsDropdown, setShowResultsDropdown] = React.useState(false);
    const [announcementIndex, setAnnouncementIndex] = React.useState(0);
    const [isAnnouncementVisible, setIsAnnouncementVisible] = React.useState(true);
    const [scrolled, setScrolled] = React.useState(false);
    
    const pathname = usePathname();

    const announcements = [
        "✦ Personalisation on every order",
        "✦ 2,0,0,000+ invitations delivered across India",
        "✦ WhatsApp us — we respond within 2 hours ✦"
    ];

    React.useEffect(() => {
        const interval = setInterval(() => {
            setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
                if (res.ok) {
                    // Normalize prices like in homepage mapper
                    const mapped = data.map((p: any) => ({
                        ...p,
                        defaultPrice: p.packages?.[0]?.priceTiers?.[0]?.pricePerCard || p.packages?.[0]?.pricePerCard || 50
                    }));
                    setSearchResults(mapped.slice(0, 5));
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Catalogue", href: "/catalog" },
        { name: "Digital Invites", href: "/digital-invites" },
        { name: "Policies", href: "/policies" },
    ];

    return (
        <>
            {/* 0. Announcement Bar */}
            <AnimatePresence>
                {isAnnouncementVisible && !scrolled && (
                    <motion.div 
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#6E4B8B] h-8 text-white flex items-center justify-center fixed top-0 left-0 right-0 z-[60] overflow-hidden"
                    >
                        <div className="site-container w-full flex items-center justify-center px-8">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={announcementIndex}
                                    initial={{ y: 12, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -12, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-[11px] font-medium tracking-[0.06em] text-center"
                                >
                                    {announcements[announcementIndex]}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                        <button 
                            onClick={() => setIsAnnouncementVisible(false)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:opacity-100 opacity-70 text-sm font-bold w-6 h-6 flex items-center justify-center transition-opacity"
                        >
                            ×
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <nav
                className={cn(
                    "fixed z-50 w-full transition-all duration-300 ease-in-out h-[58px] flex items-center bg-[#FAF8F5]/90 backdrop-blur-md shadow-sm border-b border-black/5 text-slate-800",
                    (isAnnouncementVisible && !scrolled) ? "top-8" : "top-0"
                )}
            >
                <div className="site-container w-full flex items-center justify-between px-4 lg:px-6">
                    {/* Logo/Brand (Left Column) */}
                    <div className="flex-1 flex justify-start">
                        <Link href="/" className="flex items-center gap-3 group">
                            <LogoIcon size={30} className="text-[#ae7fcb]" />
                            <span 
                                className="text-[28px] font-semibold italic text-[#ae7fcb]"
                                style={{ fontFamily: 'var(--font-fraunces), serif' }}
                            >
                                Zubizo
                            </span>
                        </Link>
                    </div>

                    {/* Nav Links (Center Column) */}
                    <div className="hidden lg:flex flex-1 justify-center items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "text-[12px] font-medium uppercase tracking-[0.1em] py-1.5 transition-colors relative group text-slate-600 hover:text-[#ae7fcb] whitespace-nowrap",
                                    pathname === link.href && "text-[#ae7fcb]"
                                )}
                            >
                                {link.name}
                                <span className={cn(
                                    "absolute bottom-0 left-0 h-[1.5px] transition-all duration-300 group-hover:w-full bg-[#ae7fcb]",
                                    pathname === link.href ? "w-full" : "w-0"
                                )} />
                            </Link>
                        ))}
                    </div>

                    {/* Search & Actions (Right Column) */}
                    <div className="flex-1 flex justify-end items-center gap-4 relative">
                        <div className="relative hidden md:block w-60">
                            <input
                                type="text"
                                placeholder="Search catalogue..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowResultsDropdown(true)}
                                onBlur={() => setTimeout(() => setShowResultsDropdown(false), 200)}
                                className="w-full rounded-full py-1.5 pl-8 pr-4 text-[11px] font-medium transition-all outline-none border bg-slate-100 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#ae7fcb]/30"
                            />
                            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                            {/* Dropdown Results */}
                            <AnimatePresence>
                                {showResultsDropdown && searchQuery.length >= 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        className="absolute top-full right-0 mt-3 w-[280px] bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden p-2 z-50 text-slate-800"
                                    >
                                        {isSearching ? (
                                            <div className="p-6 text-center text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                                                Searching...
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            <div className="space-y-1">
                                                {searchResults.map((p) => (
                                                    <Link
                                                        key={p._id}
                                                        href={`/catalog/${p.slug}`}
                                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                                                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[11px] font-bold text-slate-700 truncate">{p.name}</div>
                                                            <div className="text-[9px] text-slate-400">from ₹{p.defaultPrice}</div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-6 text-center text-slate-400 text-[10px]">No results found</div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mobile Menu Trigger */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-slate-700 hover:opacity-80 transition-opacity"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed left-0 right-0 z-40 bg-[#FAF8F5] border-b border-slate-100 shadow-xl p-6 space-y-6 pt-24"
                    >
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search catalogue..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl py-3 pl-10 pr-4 text-xs font-semibold bg-slate-100 border-none outline-none focus:ring-2 focus:ring-[#ae7fcb]/20"
                            />
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>

                        <div className="flex flex-col gap-4 text-center">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-slate-700 font-bold uppercase tracking-wider text-xs py-2 hover:bg-[#ae7fcb]/10 rounded-xl"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
