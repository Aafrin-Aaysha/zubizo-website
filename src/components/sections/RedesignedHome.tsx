'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Menu, 
    X, 
    ArrowRight, 
    Instagram, 
    Check, 
    Heart, 
    ShoppingBag, 
    Smile, 
    Users, 
    Sparkles, 
    Award, 
    Clock, 
    Globe, 
    ShieldCheck,
    Gift
} from 'lucide-react';
import { LogoIcon } from "@/components/ui/logo-icon";
import { cn } from "@/lib/utils";

// --- Types & Configs ---
interface Product {
    _id: string;
    name: string;
    slug: string;
    images: string[];
    defaultPrice?: number;
    sku?: string;
    isTrending?: boolean;
    isFeatured?: boolean;
    categoryName?: string;
}

interface RedesignedHomeProps {
    bestSellers: Product[];
    newArrivals: Product[];
    categories: any[];
    siteSettings: any;
}

const CATEGORIES = [
    { name: "South Indian Traditional", slug: "south-indian-traditional-wedding", img: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=300&auto=format&fit=crop" },
    { name: "Modern & Minimal", slug: "modern-minimal", img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=300&auto=format&fit=crop" },
    { name: "Luxury", slug: "luxury", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=300&auto=format&fit=crop" },
    { name: "Religious & Cultural", slug: "religious-cultural", img: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=300&auto=format&fit=crop" },
    { name: "Nikkah", slug: "nikkah", img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=300&auto=format&fit=crop" },
    { name: "Baby Shower", slug: "baby-shower", img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=300&auto=format&fit=crop" },
    { name: "Housewarming", slug: "housewarming", img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop" },
    { name: "Digital Invites", slug: "digital-invites", img: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=300&auto=format&fit=crop", isRoute: true }
];

const PRICE_SLABS = [
    { title: "Under ₹50", subtitle: "Affordable Elegance", img: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=300&auto=format&fit=crop", link: "/catalog?maxPrice=50", popular: false },
    { title: "₹50 - ₹100", subtitle: "Premium Craftsmanship", img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=300&auto=format&fit=crop", link: "/catalog?minPrice=50&maxPrice=100", popular: true },
    { title: "₹100 - ₹200", subtitle: "Handcrafted Luxury", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=300&auto=format&fit=crop", link: "/catalog?minPrice=100&maxPrice=200", popular: false },
    { title: "₹200 & Above", subtitle: "Couture Masterpieces", img: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=300&auto=format&fit=crop", link: "/catalog?minPrice=200", popular: false },
];

const REACH_COUNTRIES = [
    { name: "India", emoji: "🇮🇳" },
    { name: "UAE", emoji: "🇦🇪" },
    { name: "UK", emoji: "🇬🇧" },
    { name: "USA", emoji: "🇺🇸" },
    { name: "Canada", emoji: "🇨🇦" },
    { name: "Australia", emoji: "🇦🇺" },
    { name: "Singapore", emoji: "🇸🇬" },
    { name: "Malaysia", emoji: "🇲🇾" },
    { name: "Qatar", emoji: "🇶🇦" },
    { name: "Saudi Arabia", emoji: "🇸🇦" },
];

const MAP_DOTS = [
    { cx: 310, cy: 155, name: "India" }, // India
    { cx: 275, cy: 140, name: "UAE" },   // UAE
    { cx: 215, cy: 95, name: "UK" },     // UK
    { cx: 100, cy: 105, name: "USA" },    // USA
    { cx: 90, cy: 85, name: "Canada" },   // Canada
    { cx: 410, cy: 235, name: "Australia" }, // Australia
    { cx: 335, cy: 180, name: "Singapore" }, // Singapore
    { cx: 330, cy: 175, name: "Malaysia" },  // Malaysia
    { cx: 280, cy: 145, name: "Qatar" },     // Qatar
    { cx: 270, cy: 147, name: "Saudi Arabia" }, // Saudi Arabia
];

const INSTAGRAM_POSTS = [
    { id: 1, url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=500&auto=format&fit=crop", link: "https://instagram.com/zubizo.art" },
    { id: 2, url: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=500&auto=format&fit=crop", link: "https://instagram.com/zubizo.art" },
    { id: 3, url: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=500&auto=format&fit=crop", link: "https://instagram.com/zubizo.art" },
    { id: 4, url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=500&auto=format&fit=crop", link: "https://instagram.com/zubizo.art" }
];

const TESTIMONIALS = [
    { name: "Priya & Anand", location: "Chennai", quote: "The South Indian traditional card we ordered was absolutely stunning. All our guests complimented the texture and gold foil detailing!" },
    { name: "Sarah & Fahad", location: "Dubai", quote: "Working with Zubizo was so seamless. They accommodated all our custom changes on WhatsApp and shipped it to Dubai in record time." },
    { name: "Meera Patel", location: "Toronto", quote: "Absolutely premium invitations. The wax seal initial card feels heavy, elegant, and looks like a work of art. Highly recommended!" }
];

// Simple simplified SVG world map paths
const WORLD_MAP_PATH = "M 50,80 Q 80,45 100,50 Q 120,55 140,80 T 180,90 T 210,80 T 250,90 T 270,110 T 300,105 T 320,135 T 340,165 T 360,195 T 380,215 T 410,240 T 430,260 M 350,110 Q 370,80 400,90 Q 420,100 440,110 T 460,130 M 200,120 Q 220,130 240,140 T 260,150 T 280,160 M 120,150 Q 130,170 150,190 T 170,220 T 190,250";

export function RedesignedHome({ bestSellers, newArrivals, siteSettings }: RedesignedHomeProps) {
    // 0. Announcement Bar Rotation
    const [announcementIndex, setAnnouncementIndex] = useState(0);
    const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
    const announcements = [
        "✦ Personalisation on every order",
        "✦ 2,0,0,000+ invitations delivered across India",
        "✦ WhatsApp us — we respond within 2 hours ✦"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    // Scroll tracking for Navbar & Scroll Animations
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Intersection Observer for animations
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('iz-visible');
                }
            });
        }, { threshold: 0.1 });

        const anims = document.querySelectorAll('.iz-animate');
        anims.forEach(el => observer.observe(el));

        return () => {
            anims.forEach(el => observer.unobserve(el));
        };
    }, []);

    // Navbar search & mobile menu states
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [showResultsDropdown, setShowResultsDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const res = await fetch(`/api/designs?search=${searchQuery}`);
                const data = await res.json();
                if (res.ok) setSearchResults(data.slice(0, 5));
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchSearchResults, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Hero Slider Ken Burns specs
    const [heroIndex, setHeroIndex] = useState(0);
    const heroSlides = [
        {
            eyebrow: "Bespoke Invitation Atelier",
            title: "Crafting Love Stories on Premium Paper",
            bg: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop"
        },
        {
            eyebrow: "Exquisite Craftsmanship",
            title: "Where Tradition Meets Luxury Design",
            bg: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=1200&auto=format&fit=crop"
        },
        {
            eyebrow: "Artisanal Wedding Suites",
            title: "Your Perfect Invitation, Beautifully Made",
            bg: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1200&auto=format&fit=crop"
        }
    ];

    useEffect(() => {
        const sliderTimer = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(sliderTimer);
    }, []);

    // Numbers animation
    const numbersSectionRef = useRef<HTMLDivElement>(null);
    const [numbersTriggered, setNumbersTriggered] = useState(false);
    const [numbers, setNumbers] = useState([
        { label: "Happy Families", target: 8000, value: 0 },
        { label: "Cards Handcrafted", target: 200000, value: 0 },
        { label: "Countries Served", target: 10, value: 0 },
        { label: "Artisanal Designs", target: 120, value: 0 },
        { label: "Years of Craft", target: 6, value: 0 }
    ]);

    useEffect(() => {
        const el = numbersSectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !numbersTriggered) {
                setNumbersTriggered(true);
                numbers.forEach((num, idx) => {
                    let start = performance.now();
                    const duration = 1800;
                    const update = (time: number) => {
                        let elapsed = time - start;
                        let progress = Math.min(elapsed / duration, 1);
                        let ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
                        setNumbers(prev => {
                            const next = [...prev];
                            next[idx].value = Math.floor(ease * num.target);
                            return next;
                        });
                        if (progress < 1) requestAnimationFrame(update);
                    };
                    requestAnimationFrame(update);
                });
            }
        }, { threshold: 0.2 });

        observer.observe(el);
        return () => observer.disconnect();
    }, [numbersTriggered]);

    return (
        <div className="bg-[#FAF8F5] min-h-screen relative overflow-x-hidden font-dmsans">
            
            {/* 0. Announcement Bar */}
            <AnimatePresence>
                {isAnnouncementVisible && (
                    <motion.div 
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#6E4B8B] h-8 text-white flex items-center justify-center relative z-[60] overflow-hidden"
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

            {/* 1. Navbar */}
            {/* 1. Navbar */}
            <nav
                className={cn(
                    "fixed z-50 w-full transition-all duration-300 ease-in-out h-[58px] flex items-center bg-[#FAF8F5]/90 backdrop-blur-md shadow-sm border-b border-black/5 text-slate-800",
                    isAnnouncementVisible ? "top-8" : "top-0"
                )}
            >
                <div className="site-container w-full flex items-center justify-between px-4 lg:px-6">
                    {/* Logo/Brand */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <LogoIcon size={30} className="text-[#ae7fcb]" />
                        <span 
                            className="text-[28px] font-extrabold italic text-[#ae7fcb]"
                            style={{ fontFamily: 'var(--font-fraunces), serif' }}
                        >
                            Zubizo
                        </span>
                    </Link>

                    {/* Navigation links and Search/Actions grouped to the right */}
                    <div className="flex items-center gap-8">
                        {/* Nav Links */}
                        <div className="hidden lg:flex items-center space-x-8">
                            {[
                                { name: "Home", href: "/" },
                                { name: "Catalogue", href: "/catalog" },
                                { name: "Digital Invites", href: "/digital-invites" },
                                { name: "Our Story", href: "/about" },
                                { name: "Policies", href: "/policies" }
                            ].map((link) => (
                                <Link 
                                    key={link.name} 
                                    href={link.href}
                                    className="text-[12px] font-medium uppercase tracking-[0.1em] py-1.5 transition-colors relative group text-slate-600 hover:text-[#ae7fcb]"
                                >
                                    {link.name}
                                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] transition-all duration-300 group-hover:w-full bg-[#ae7fcb]" />
                                </Link>
                            ))}
                        </div>

                        {/* Search & Actions */}
                        <div className="flex items-center gap-4 relative">
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
                                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450" />

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
                                                    {searchResults.map(p => (
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
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450" />
                        </div>

                        <div className="flex flex-col gap-4 text-center">
                            {[
                                { name: "Home", href: "/" },
                                { name: "Catalogue", href: "/catalog" },
                                { name: "Digital Invites", href: "/digital-invites" },
                                { name: "Our Story", href: "/about" },
                                { name: "Policies", href: "/policies" }
                            ].map((link) => (
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

            {/* 3. Category Circles (Centered, Larger, below fixed Navbar) */}
            <section className={cn(
                "py-6 bg-white border-b border-slate-100 transition-all duration-300 relative z-30",
                isAnnouncementVisible ? "mt-[90px]" : "mt-[58px]"
            )}>
                <div className="site-container">
                    <div className="flex items-center justify-start lg:justify-center gap-6 md:gap-10 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-none snap-x snap-mandatory">
                        {CATEGORIES.map((cat, idx) => (
                            <Link 
                                key={cat.name} 
                                href={cat.isRoute ? "/digital-invites" : `/catalog?category=${cat.slug}`}
                                className="flex flex-col items-center shrink-0 snap-center group"
                            >
                                <div className="w-[72px] h-[72px] md:w-[92px] md:h-[92px] rounded-none overflow-hidden border-2 border-[#EDE8F6] group-hover:border-[#ae7fcb] transition-all duration-300 shadow-md">
                                    <img 
                                        src={cat.img} 
                                        alt={cat.name} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.06]" 
                                    />
                                </div>
                                <span className="text-[10px] md:text-[11px] font-semibold text-slate-700 group-hover:text-[#ae7fcb] mt-3 transition-colors duration-300 text-center max-w-[110px] leading-tight">
                                    {cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 2. Hero Slider (Ken Burns effect) */}
            <section className="h-[95vh] md:h-screen w-full relative overflow-hidden bg-slate-900">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={heroIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        {/* Ken Burns Zoom Slide Image */}
                        <motion.div 
                            initial={{ scale: 1 }}
                            animate={{ scale: 1.07 }}
                            transition={{ duration: 5, ease: 'linear' }}
                            className="absolute inset-0"
                        >
                            <img 
                                src={heroSlides[heroIndex].bg} 
                                alt="luxury backdrop" 
                                className="w-full h-full object-cover object-center"
                            />
                        </motion.div>
                        <div className="absolute inset-0 bg-black/25" />

                        {/* Content Container */}
                        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                            <div className="max-w-3xl space-y-6">
                                <motion.span 
                                    initial={{ y: 15, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="block text-[11px] font-medium text-white uppercase tracking-[0.22em] font-dmsans"
                                >
                                    {heroSlides[heroIndex].eyebrow}
                                </motion.span>
                                
                                <motion.h1 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-4xl md:text-6xl text-white font-italiana font-normal leading-tight tracking-wide max-w-4xl mx-auto"
                                >
                                    {heroSlides[heroIndex].title}
                                </motion.h1>

                                <motion.div 
                                    initial={{ y: 15, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="pt-4"
                                >
                                    <Link 
                                        href="/catalog"
                                        className="inline-block px-8 py-3 border border-white text-white text-xs uppercase tracking-[0.15em] font-semibold hover:bg-white hover:text-slate-900 transition-all duration-300 rounded-full"
                                    >
                                        Explore Collection
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Pagination Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
                    {heroSlides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setHeroIndex(idx)}
                            className="relative w-6 h-6 flex items-center justify-center focus:outline-none"
                            aria-label={`Go to slide ${idx + 1}`}
                        >
                            {heroIndex === idx && (
                                <motion.div 
                                    layoutId="activeHeroDot"
                                    className="absolute inset-0 border border-white rounded-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                heroIndex === idx ? "bg-white" : "bg-white/40"
                            )} />
                        </button>
                    ))}
                </div>
            </section>



            {/* 4. Best Sellers */}
            <section className="py-16 bg-[#FAF8F5]">
                <div className="site-container">
                    <div className="text-center mb-10 iz-animate">
                        <span className="text-[10px] font-bold tracking-[0.15em] text-[#6E4B8B] uppercase">OUR BESTSELLERS</span>
                        <h2 className="text-2xl md:text-3xl font-italiana font-normal text-slate-800 mt-2">Chosen by Thousands of Families</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                        {bestSellers.map((product, idx) => (
                            <motion.div 
                                key={product._id}
                                className="bg-white border border-slate-100 rounded-none overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group iz-animate"
                                style={{ transitionDelay: `${idx * 60}ms` }}
                            >
                                {/* Image Zone */}
                                <div className="aspect-square w-full overflow-hidden relative bg-slate-50">
                                    <img 
                                        src={product.images[0]} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                    />
                                    {/* Bestseller Badge */}
                                    <span className="absolute top-3 left-3 bg-[#ae7fcb] text-white text-[8px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full shadow-sm">
                                        BESTSELLER
                                    </span>
                                    
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                        <Link 
                                            href={`/catalog/${product.slug}`}
                                            className="px-5 py-2.5 bg-white text-[#ae7fcb] font-bold text-[10px] uppercase tracking-wider rounded-full shadow transition-transform duration-300 scale-90 group-hover:scale-100"
                                        >
                                            Enquire →
                                        </Link>
                                    </div>
                                </div>
                                {/* Info Zone */}
                                <div className="p-3.5 flex flex-col flex-1 justify-between gap-1">
                                    <div>
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-[#ae7fcb]">{product.categoryName || 'Wedding Invitation'}</span>
                                        <h3 className="font-bold text-slate-800 text-[10px] md:text-[11px] line-clamp-2 mt-0.5 group-hover:text-[#ae7fcb] transition-colors leading-tight font-sans">
                                            {product.name}
                                        </h3>
                                        <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">SKU: {product.sku || 'ZBZ-100'}</span>
                                    </div>
                                    <span className="font-bold text-[#ae7fcb] text-[10px] mt-2 block">from ₹{product.defaultPrice || 50}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. New Arrivals with Marquee Strip */}
            <section className="py-16 bg-white">
                {/* Marquee Strip */}
                <div className="bg-[#EDE8F6] h-7 flex items-center overflow-hidden w-full select-none mb-10 border-y border-[#ae7fcb]/10">
                    <div className="animate-marquee whitespace-nowrap flex gap-4 text-[#6E4B8B] text-[10px] font-bold uppercase tracking-[0.12em]">
                        <span>NEW · JUST IN · FRESH FROM THE STUDIO · NEW · JUST IN · FRESH FROM THE STUDIO · NEW · JUST IN · FRESH FROM THE STUDIO ·&nbsp;</span>
                        <span>NEW · JUST IN · FRESH FROM THE STUDIO · NEW · JUST IN · FRESH FROM THE STUDIO · NEW · JUST IN · FRESH FROM THE STUDIO ·&nbsp;</span>
                    </div>
                </div>

                <div className="site-container">
                    <div className="text-center mb-10 iz-animate">
                        <span className="text-[10px] font-bold tracking-[0.15em] text-[#6E4B8B] uppercase">FRESH FROM THE STUDIO</span>
                        <h2 className="text-2xl md:text-3xl font-italiana font-normal text-slate-800 mt-2">Just Designed for You</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                        {newArrivals.map((product, idx) => (
                            <motion.div 
                                key={product._id}
                                className="bg-white border border-slate-100 rounded-none overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group iz-animate"
                                style={{ transitionDelay: `${idx * 60}ms` }}
                            >
                                {/* Image Zone */}
                                <div className="aspect-square w-full overflow-hidden relative bg-slate-50">
                                    <img 
                                        src={product.images[0]} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                    />
                                    {/* New Badge */}
                                    <span className="absolute top-3 left-3 bg-[#0F6E56] text-white text-[8px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full shadow-sm">
                                        NEW
                                    </span>
                                    
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                        <Link 
                                            href={`/catalog/${product.slug}`}
                                            className="px-5 py-2.5 bg-white text-[#ae7fcb] font-bold text-[10px] uppercase tracking-wider rounded-full shadow transition-transform duration-300 scale-90 group-hover:scale-100"
                                        >
                                            Enquire →
                                        </Link>
                                    </div>
                                </div>
                                {/* Info Zone */}
                                <div className="p-3.5 flex flex-col flex-1 justify-between gap-1">
                                    <div>
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-[#ae7fcb]">{product.categoryName || 'Wedding Invitation'}</span>
                                        <h3 className="font-bold text-slate-800 text-[10px] md:text-[11px] line-clamp-2 mt-0.5 group-hover:text-[#ae7fcb] transition-colors leading-tight font-sans">
                                            {product.name}
                                        </h3>
                                        <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">SKU: {product.sku || 'ZBZ-100'}</span>
                                    </div>
                                    <span className="font-bold text-[#ae7fcb] text-[10px] mt-2 block">from ₹{product.defaultPrice || 50}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Why Zubizo Strip */}
            <section className="py-12 bg-slate-900 text-white border-y border-white/5">
                <div className="site-container">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {[
                            { title: "Artisanal Craft", desc: "Handcrafted with detail and luxury materials", icon: <Award className="text-[#D6BFA3] mx-auto" size={24} /> },
                            { title: "Worldwide Shipping", desc: "Delivered securely to families across 10 countries", icon: <Globe className="text-[#D6BFA3] mx-auto" size={24} /> },
                            { title: "Fast Personalisation", desc: "Easy custom tweaks with 24h design approval", icon: <Clock className="text-[#D6BFA3] mx-auto" size={24} /> },
                            { title: "Trusted Promise", desc: "Quality checks on every card before dispatch", icon: <ShieldCheck className="text-[#D6BFA3] mx-auto" size={24} /> }
                        ].map((prop, idx) => (
                            <div key={prop.title} className="space-y-2.5 iz-animate" style={{ transitionDelay: `${idx * 60}ms` }}>
                                {prop.icon}
                                <h4 className="font-bold text-[13px] text-white tracking-wide uppercase">{prop.title}</h4>
                                <p className="text-[11px] text-slate-400 leading-normal max-w-[200px] mx-auto font-light">{prop.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. "Design Your Own" CTA Banner */}
            <section className="py-16 bg-gradient-to-br from-[#4c2c62] via-[#6E4B8B] to-[#ae7fcb] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(174,127,203,0.15),transparent)] pointer-events-none" />
                <div className="site-container text-center max-w-2xl px-6 relative z-10 space-y-5 iz-animate">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#EDE8F6]/90 uppercase">BESPOKE ORDERS</span>
                    <h2 className="text-3xl md:text-4xl font-italiana font-normal text-white leading-tight">Have a Vision? Let's Craft It Together</h2>
                    <p className="text-xs md:text-sm text-white/80 font-light max-w-lg mx-auto leading-relaxed">
                        Share your ideas on WhatsApp and our team will design something you'll treasure forever.
                    </p>
                    <div className="pt-2">
                        <a 
                            href="https://wa.me/918124548133" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-slate-100 text-[#ae7fcb] font-bold text-xs rounded-full transition-all shadow-lg shadow-slate-950/20 active:scale-[0.98]"
                        >
                            Chat with Us on WhatsApp →
                        </a>
                    </div>
                </div>
            </section>

            {/* 8. Shop by Price */}
            <section className="py-16 bg-[#FAF8F5]">
                <div className="site-container">
                    <div className="text-center mb-10 iz-animate">
                        <span className="text-[10px] font-bold tracking-[0.15em] text-[#6E4B8B] uppercase">PRICE RANGES</span>
                        <h2 className="text-2xl md:text-3xl font-italiana font-normal text-slate-800 mt-2">Find Your Perfect Range</h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                        {PRICE_SLABS.map((slab, idx) => (
                            <Link 
                                key={slab.title} 
                                href={slab.link}
                                className={cn(
                                    "p-6 rounded-none border flex flex-col justify-between min-h-[160px] relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group iz-animate",
                                    slab.popular 
                                        ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-950/10" 
                                        : "bg-white border-[#ae7fcb]/10 text-slate-700 hover:border-[#ae7fcb]/40"
                                )}
                                style={{ transitionDelay: `${idx * 60}ms` }}
                            >
                                {slab.popular && (
                                    <span className="absolute top-3 right-3 bg-[#ae7fcb] text-white text-[8px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full">
                                        MOST POPULAR
                                    </span>
                                )}
                                <div className="space-y-1">
                                    <h3 className={cn("text-[13px] font-bold font-sans", slab.popular ? "text-[#D6BFA3]" : "text-slate-800")}>{slab.title}</h3>
                                    <p className={cn("text-[9px] font-medium", slab.popular ? "text-slate-400" : "text-slate-500")}>{slab.subtitle}</p>
                                </div>
                                <span className={cn("text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 mt-6", slab.popular ? "text-white" : "text-[#ae7fcb]")}>
                                    Browse Range <ArrowRight size={10} className="transition-transform group-hover:translate-x-1" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 9. "As Seen In" / Trust Strip */}
            <section className="py-16 bg-white border-y border-slate-100">
                <div className="site-container">
                    <div className="text-center mb-8 iz-animate">
                        <span className="text-[10px] font-bold tracking-[0.15em] text-[#6E4B8B] uppercase">OUR REACH</span>
                        <h2 className="text-2xl md:text-3xl font-italiana font-normal text-slate-800 mt-2">Trusted Across 10 Countries</h2>
                        <p className="text-slate-500 text-xs font-medium mt-1">From Trichy to Toronto — Zubizo invitations have been delivered to families across the world.</p>
                    </div>

                    {/* Desktop Map (Hidden on mobile) */}
                    <div className="hidden lg:block relative max-w-3xl mx-auto mb-10 overflow-hidden bg-[#FAF8F5]/50 border border-[#ae7fcb]/10 rounded-3xl p-6 shadow-inner">
                        <svg viewBox="0 0 500 300" className="w-full h-auto text-purple-100 fill-current">
                            {/* Detailed World Map Silhouette from Wikimedia */}
                            <image 
                                href="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg" 
                                x="0" 
                                y="0" 
                                width="500" 
                                height="300" 
                                opacity="0.12" 
                                preserveAspectRatio="none"
                            />
                            {MAP_DOTS.map((dot, idx) => (
                                <g key={idx} className="relative cursor-pointer group">
                                    {/* Pulse circle */}
                                    <circle 
                                        cx={dot.cx} 
                                        cy={dot.cy} 
                                        r="8" 
                                        className="fill-[#ae7fcb]/20 animate-pulse-dot" 
                                    />
                                    {/* Solid center dot */}
                                    <circle 
                                        cx={dot.cx} 
                                        cy={dot.cy} 
                                        r="3.5" 
                                        className="fill-[#ae7fcb] border border-white" 
                                    />
                                    {/* Tooltip on hover */}
                                    <text 
                                        x={dot.cx} 
                                        y={dot.cy - 10} 
                                        className="text-[8px] font-bold fill-slate-800 text-center opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 shadow-sm font-sans"
                                        textAnchor="middle"
                                    >
                                        {dot.name}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>

                    {/* Flag Ticker Strip */}
                    <div className="bg-[#FAF8F5] py-4 rounded-2xl overflow-hidden w-full select-none border border-slate-50 flex items-center justify-center">
                        <div className="animate-marquee-slow whitespace-nowrap flex gap-8 text-slate-600 text-[11px] font-medium tracking-wide">
                            {REACH_COUNTRIES.concat(REACH_COUNTRIES).map((country, idx) => (
                                <span key={idx} className="flex items-center gap-1.5">
                                    <span>{country.emoji}</span>
                                    <span>{country.name}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 10. Trending on Instagram */}
            <section className="py-16 bg-[#FAF8F5]">
                <div className="site-container">
                    <div className="text-center mb-10 iz-animate">
                        <span className="text-[10px] font-bold tracking-[0.15em] text-[#6E4B8B] uppercase">TRENDING NOW</span>
                        <h2 className="text-2xl md:text-3xl font-italiana font-normal text-slate-800 mt-2">Invitations Worth Talking About</h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {INSTAGRAM_POSTS.map((post, idx) => (
                            <a 
                                key={post.id} 
                                href={post.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="aspect-square bg-slate-100 rounded-none overflow-hidden relative border border-slate-100 group shadow-sm hover:shadow-md transition-all duration-300 iz-animate"
                                style={{ transitionDelay: `${idx * 60}ms` }}
                            >
                                <img src={post.url} alt="instagram preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="text-center text-white space-y-1 scale-95 group-hover:scale-100 transition-transform duration-300">
                                        <Instagram size={20} className="mx-auto" />
                                        <span className="text-[10px] font-bold tracking-wider uppercase block">@zubizo.art</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* 11. Zubizo in Numbers */}
            <section ref={numbersSectionRef} className="py-16 bg-slate-900 text-white">
                <div className="site-container">
                    <div className="text-center mb-12">
                        <span className="text-[10px] font-bold tracking-[0.15em] text-[#ae7fcb] uppercase">ZUBIZO IN NUMBERS</span>
                        <h2 className="text-2xl md:text-3xl font-italiana font-normal text-white mt-2">Every Number Tells a Story</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
                        {numbers.map((num, idx) => (
                            <div key={num.label} className="space-y-1.5">
                                <h3 className="text-3xl md:text-4xl font-extrabold text-[#D6BFA3] font-sans">
                                    {num.value.toLocaleString('en-IN')}+
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{num.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 12. How It Works */}
            <section className="py-16 bg-white border-b border-slate-100">
                <div className="site-container">
                    <div className="text-center mb-12 iz-animate">
                        <span className="text-[10px] font-bold tracking-[0.15em] text-[#6E4B8B] uppercase">THE PROCESS</span>
                        <h2 className="text-2xl md:text-3xl font-italiana font-normal text-slate-800 mt-2">Simple. Elegant. Personal.</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative max-w-4xl mx-auto">
                        {/* Connecting Line (Dashed SVGs for Desktop) */}
                        <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-0.5 z-0 pointer-events-none">
                            <svg className="w-full h-full text-purple-100 stroke-current" strokeDasharray="5,5">
                                <line x1="0" y1="0" x2="100%" y2="0" strokeWidth="2" />
                            </svg>
                        </div>

                        {[
                            { step: "01", title: "Select Design", desc: "Choose from our curated collection of physical invites, wax seals, or digital websites." },
                            { step: "02", title: "Share Details", desc: "Submit your text, event dates, and customize details easily over WhatsApp or email." },
                            { step: "03", title: "Review & Dispatch", desc: "Approve the digital draft within 24h, and watch us craft and deliver with care." }
                        ].map((item, idx) => (
                            <div key={item.step} className="text-center space-y-4 relative z-10 iz-animate" style={{ transitionDelay: `${idx * 100}ms` }}>
                                <div className="w-[80px] h-[80px] rounded-full bg-[#EDE8F6]/70 border border-[#ae7fcb]/20 flex items-center justify-center text-xl font-bold text-[#ae7fcb] mx-auto shadow-sm">
                                    {item.step}
                                </div>
                                <h3 className="font-bold text-slate-800 text-[13px] uppercase tracking-wider">{item.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed max-w-[240px] mx-auto font-light">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 13. Testimonials */}
            <section className="py-16 bg-[#FAF8F5]">
                <div className="site-container">
                    <div className="text-center mb-10 iz-animate">
                        <span className="text-[10px] font-bold tracking-[0.15em] text-[#6E4B8B] uppercase">CLIENT LOVE</span>
                        <h2 className="text-2xl md:text-3xl font-italiana font-normal text-slate-800 mt-2">Words from the Families We've Served</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {TESTIMONIALS.map((test, idx) => (
                            <div 
                                key={test.name}
                                className="bg-white p-6 rounded-none border border-[#EDE8F6] shadow-sm flex flex-col justify-between space-y-4 iz-animate"
                                style={{ transitionDelay: `${idx * 80}ms` }}
                            >
                                <div className="space-y-2">
                                    {/* Star rating placeholder */}
                                    <div className="flex text-amber-400 gap-0.5 text-sm">★★★★★</div>
                                    <p className="text-slate-600 text-[11px] italic leading-relaxed font-light">"{test.quote}"</p>
                                </div>
                                <div className="flex items-center gap-2 border-t border-[#EDE8F6]/30 pt-3">
                                    <div className="w-8 h-8 rounded-none bg-[#EDE8F6] flex items-center justify-center font-bold text-[#ae7fcb] text-xs shadow-inner uppercase">
                                        {test.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-slate-800 text-[10px]">{test.name}</div>
                                        <div className="text-[8px] text-slate-450 font-semibold">{test.location}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 14. Footer */}
            <footer className="bg-[#111111] text-[#888888] pt-16 pb-8 border-t border-white/5 font-sans">
                <div className="site-container">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/5 pb-12 text-xs">
                        
                        {/* Col 1 - Brand */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <LogoIcon size={24} className="text-[#ae7fcb]" />
                                <span 
                                    className="text-2xl font-extrabold italic text-white"
                                    style={{ fontFamily: 'var(--font-fraunces), serif' }}
                                >
                                    Zubizo
                                </span>
                            </div>
                            <p className="text-[12px] leading-relaxed max-w-[220px] font-light">
                                Premium handcrafted invitation designs — crafted with love in India.
                            </p>
                            <div className="flex items-center gap-3.5 pt-2">
                                <a href="https://instagram.com/zubizo.art" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                    <Instagram size={18} />
                                </a>
                                <a href="https://wa.me/918124548133" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                    <ShoppingBag size={18} />
                                </a>
                            </div>
                        </div>

                        {/* Col 2 - Quick Links */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Quick Links</h4>
                            <div className="flex flex-col gap-2.5 font-light">
                                {['Catalogue', 'Digital Invites', 'Our Story', 'Policies'].map((item) => (
                                    <Link key={item} href={item === 'Catalogue' ? '/catalog' : item === 'Digital Invites' ? '/digital-invites' : item === 'Our Story' ? '/about' : '/policies'} className="hover:text-white transition-colors">
                                        {item}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Col 3 - Legal */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Legal Info</h4>
                            <div className="flex flex-col gap-2.5 font-light">
                                {['Privacy Policy', 'Terms & Conditions', 'Refund Policy'].map((item) => (
                                    <Link key={item} href="/policies" className="hover:text-white transition-colors">
                                        {item}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Col 4 - Contact Us */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Contact Us</h4>
                            <div className="space-y-3 font-light">
                                <p className="leading-relaxed">📍 SS Arcade, 3F, Convent Road, Cantonment, Trichy 620001</p>
                                <p>📞 <a href="tel:+918124548133" className="hover:text-white transition-colors">+91 81245 48133</a></p>
                                <div>
                                    <a 
                                        href="https://wa.me/918124548133" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366] text-white text-[10px] font-bold rounded-lg hover:opacity-95 transition-opacity"
                                    >
                                        Chat on WhatsApp
                                    </a>
                                </div>
                                <p className="text-[10px] text-slate-500">🕐 Mon–Sat, 10:00 AM – 8:00 PM</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 text-[11px] text-[#444444] font-semibold">
                        <span>© 2026 Zubizo Art</span>
                        <span>Handcrafted with Love in India ♥</span>
                    </div>
                </div>
            </footer>
            {/* Floating Action Buttons */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
                {/* WhatsApp Button */}
                <a 
                    href="https://wa.me/918124548133" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                    aria-label="Chat on WhatsApp"
                >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.742.002-2.602-1.005-5.05-2.839-6.89C16.656 2.132 14.21 1.123 11.609 1.123c-5.445 0-9.873 4.37-9.877 9.745-.002 1.83.483 3.61 1.405 5.178l-.924 3.376 3.444-.903zm12.351-6.938c-.3-.15-1.777-.878-2.047-.976-.27-.099-.467-.149-.662.15-.195.298-.755.951-.926 1.149-.17.198-.34.223-.64.073-.3-.15-1.268-.467-2.414-1.49-1.037-.925-1.737-2.068-1.94-2.418-.204-.35-.022-.539.128-.688.135-.135.3-.35.45-.525.15-.175.2-.299.3-.499.1-.2.05-.375-.025-.525-.075-.15-.662-1.597-.907-2.192-.239-.574-.482-.496-.662-.505-.17-.009-.365-.011-.56-.011-.196 0-.515.073-.784.37-.27.299-1.03 1.008-1.03 2.458s1.05 2.846 1.196 3.045c.148.197 2.066 3.156 5.007 4.43.699.303 1.245.484 1.671.62.704.224 1.346.193 1.853.117.564-.084 1.777-.726 2.027-1.427.25-.701.25-1.302.175-1.428-.075-.125-.269-.199-.57-.349z"/>
                    </svg>
                </a>
            </div>
        </div>
    );
}
