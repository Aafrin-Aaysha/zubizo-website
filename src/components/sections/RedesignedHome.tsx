'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Menu, 
    X, 
    ArrowRight, 
    ArrowLeft,
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
    Gift,
    Flower2,
    Layers,
    Gem,
    Scroll,
    HeartHandshake,
    Baby,
    Home,
    Smartphone,
    Image,
    Video,
    Feather,
    BookOpen,
    MessageCircle,
    Package,
    Palette
} from 'lucide-react';
import { LogoIcon } from "@/components/ui/logo-icon";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { cn } from "@/lib/utils";
import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";

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

const TempleIcon = ({ className, strokeWidth = 1.8 }: { className?: string; strokeWidth?: number | string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2v3" />
        <circle cx="12" cy="2" r="0.8" fill="currentColor" />
        <path d="M10 5l-2 3v3l-2 3v8h12v-8l-2-3V8l-2-3z" />
        <path d="M9 8h6M8 11h8M6 14h12" />
        <path d="M10 22v-4a2 2 0 0 1 4 0v4" />
    </svg>
);

const ReligiousSymbolsIcon = ({ className, strokeWidth = 1.8 }: { className?: string; strokeWidth?: number | string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        {/* Om Text Symbol (Left) */}
        <text x="0.5" y="15" fontSize="10" fill="currentColor" stroke="none" style={{ fontFamily: 'var(--font-sans), sans-serif', fontWeight: 'bold' }}>ॐ</text>
        {/* Outlined Crescent Moon & Solid Star (Center) */}
        <path d="M 12.5 9 A 3.5 3.5 0 0 0 12.5 15 A 3 3 0 0 1 12.5 9" />
        <circle cx="16.5" cy="12" r="0.8" fill="currentColor" stroke="none" />
        {/* Outlined Cross (Right) */}
        <path d="M 20.5 7.5 V 16.5 M 18.5 10.5 H 22.5" />
    </svg>
);

const RingsIcon = ({ className, strokeWidth = 1.8 }: { className?: string; strokeWidth?: number | string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        {/* Ring 1 */}
        <circle cx="8.5" cy="14" r="5" />
        {/* Ring 2 */}
        <circle cx="15.5" cy="14" r="5" />
        {/* Diamond on Ring 2 */}
        <path d="M15.5 9l1.5-1.5-1.5-1.5-1.5 1.5z" fill="currentColor" stroke="none" />
    </svg>
);

const CATEGORIES = [
    { name: "South Indian Traditional", slug: "south-indian-traditional-wedding", dbName: "South Indian Traditional Wedding", img: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=300&auto=format&fit=crop" },
    { name: "Modern & Minimal", slug: "modern-minimal", dbName: "Modern & Minimal", img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=300&auto=format&fit=crop" },
    { name: "Luxury", slug: "luxury", dbName: "Luxury", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=300&auto=format&fit=crop" },
    { name: "Religious & Cultural", slug: "religious-cultural", dbName: "Religious & Cultural", img: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=300&auto=format&fit=crop" },
    { name: "Engagement", slug: "engagement", dbName: "Engagement", img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=300&auto=format&fit=crop" },
    { name: "Baby Shower", slug: "baby-shower", dbName: "Baby Shower", img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=300&auto=format&fit=crop" },
    { name: "Housewarming", slug: "housewarming", dbName: "Housewarming", img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop" },
    { name: "E-Invite (Image)", slug: "image-invite", img: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=300&auto=format&fit=crop" },
    { name: "E-Invite (Video)", slug: "video-invite", img: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=300&auto=format&fit=crop" },
    { name: "E-Invite (Website)", slug: "website-invite", img: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=300&auto=format&fit=crop" }
];

const CATEGORY_ICONS: { [key: string]: React.ComponentType<any> } = {
    "south-indian-traditional-wedding": TempleIcon,
    "modern-minimal": Feather,
    "luxury": Gem,
    "religious-cultural": HeartHandshake,
    "engagement": RingsIcon,
    "image-invite": Image,
    "video-invite": Video,
    "website-invite": Globe,
    "baby-shower": Baby,
    "housewarming": Home
};

const PRICE_SLABS = [
    { title: "Under ₹50", subtitle: "Affordable Elegance", img: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=300&auto=format&fit=crop", link: "/catalog?maxPrice=50", popular: false },
    { title: "₹50 - ₹100", subtitle: "Premium Craftsmanship", img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=300&auto=format&fit=crop", link: "/catalog?minPrice=50&maxPrice=100", popular: true },
    { title: "₹100 - ₹200", subtitle: "Handcrafted Luxury", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=300&auto=format&fit=crop", link: "/catalog?minPrice=100&maxPrice=200", popular: false },
    { title: "₹200 & Above", subtitle: "Couture Masterpieces", img: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=300&auto=format&fit=crop", link: "/catalog?minPrice=200", popular: false },
];

const REACH_COUNTRIES = [
    { name: "India", emoji: "🇮🇳" },
    { name: "USA", emoji: "🇺🇸" },
    { name: "Canada", emoji: "🇨🇦" },
    { name: "Norway", emoji: "🇳🇴" },
    { name: "Australia", emoji: "🇦🇺" },
];

const MAP_DOTS = [
    { cx: 310, cy: 155, name: "India", emoji: "🇮🇳" },
    { cx: 100, cy: 105, name: "USA", emoji: "🇺🇸" },
    { cx: 90, cy: 85, name: "Canada", emoji: "🇨🇦" },
    { cx: 232, cy: 75, name: "Norway", emoji: "🇳🇴" },
    { cx: 410, cy: 235, name: "Australia", emoji: "🇦🇺" },
];

const FLAG_URLS: { [key: string]: string } = {
    "India": "https://flagcdn.com/w40/in.png",
    "USA": "https://flagcdn.com/w40/us.png",
    "Canada": "https://flagcdn.com/w40/ca.png",
    "Norway": "https://flagcdn.com/w40/no.png",
    "Australia": "https://flagcdn.com/w40/au.png"
};

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

const NUMBER_CARDS_CONFIG = [
    { 
        icon: Users, 
        iconBg: "bg-purple-50", 
        iconColor: "text-purple-600",
        sublabel: "Families who trusted us"
    },
    { 
        icon: Package, 
        iconBg: "bg-emerald-50", 
        iconColor: "text-emerald-600",
        sublabel: "Orders completed"
    },
    { 
        icon: Globe, 
        iconBg: "bg-blue-50", 
        iconColor: "text-blue-600",
        sublabel: "International orders"
    },
    { 
        icon: Palette, 
        iconBg: "bg-rose-50", 
        iconColor: "text-rose-600",
        sublabel: "Unique creations crafted"
    },
    { 
        icon: Gem, 
        iconBg: "bg-amber-50", 
        iconColor: "text-amber-600",
        sublabel: "Hand-selected finishes"
    }
];

export function RedesignedHome({ bestSellers, newArrivals, siteSettings }: RedesignedHomeProps) {
    const [isDesktop, setIsDesktop] = useState(true);
    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
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

    // Hero Slider Ken Burns specs
    const [heroIndex, setHeroIndex] = useState(0);
    const heroSlides = [
        {
            eyebrow: "Bespoke Invitation Atelier",
            title: "Crafting Love Stories on Premium Paper",
            bg: "/img1.jpg"
        },
        {
            eyebrow: "Exquisite Craftsmanship",
            title: "Where Tradition Meets Luxury Design",
            bg: "/img2.jpg"
        },
        {
            eyebrow: "Artisanal Wedding Suites",
            title: "Your Perfect Invitation, Beautifully Made",
            bg: "/img3.jpg"
        },
        {
            eyebrow: "Couture Invitations",
            title: "Elegance Captured in Every Detail",
            bg: "/img4.jpg"
        },
        {
            eyebrow: "Luxury Finishes",
            title: "Handcrafted with Passion & Precision",
            bg: "/img5.jpg"
        },
        {
            eyebrow: "Timeless Keepsakes",
            title: "Designed to Tell Your Unique Story",
            bg: "/img6.jpg"
        },
        {
            eyebrow: "Exclusive Collections",
            title: "A Perfect Beginning to Your Journey",
            bg: "/img7.jpg"
        },
        {
            eyebrow: "Fine Art Stationery",
            title: "Premium Prints & Artisanal Textures",
            bg: "/img8.jpg"
        },
        {
            eyebrow: "Bespoke Couture",
            title: "Sophisticated Designs for Every Occasion",
            bg: "/img9.jpg"
        }
    ];

    useEffect(() => {
        const sliderTimer = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(sliderTimer);
    }, []);

    const handleNextSlide = () => {
        setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    };

    const handlePrevSlide = () => {
        setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    };



    // Numbers animation
    const numbersSectionRef = useRef<HTMLDivElement>(null);
    const [numbersTriggered, setNumbersTriggered] = useState(false);
    const [numbers, setNumbers] = useState([
        { label: "HAPPY CLIENTS", target: 3000, value: 1 },
        { label: "INVITATIONS DELIVERED", target: 200000, value: 1 },
        { label: "COUNTRIES SERVED", target: 10, value: 1 },
        { label: "CUSTOM DESIGNS", target: 300, value: 1 },
        { label: "PREMIUM MATERIALS", target: 20, value: 1 }
    ]);

    useEffect(() => {
        const el = numbersSectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !numbersTriggered) {
                setNumbersTriggered(true);
                numbers.forEach((num, idx) => {
                    let start = performance.now();
                    const duration = 850; // Fast duration in milliseconds
                    const update = (time: number) => {
                        let elapsed = time - start;
                        let progress = Math.min(elapsed / duration, 1);
                        let ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart
                        setNumbers(prev => {
                            const next = [...prev];
                            next[idx].value = Math.floor(ease * (num.target - 1)) + 1;
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
            <LuxuryNavbar />

            {/* 3. Category Circles (Centered, Larger, below fixed Navbar) */}
            <section className={cn(
                "py-6 bg-transparent border-b border-slate-100 transition-all duration-300 relative z-30",
                scrolled ? "mt-[58px]" : "mt-[90px]"
            )}>
                <div className="site-container">
                    <div className="flex items-center justify-start lg:justify-center gap-6 md:gap-10 overflow-x-auto lg:overflow-x-visible pt-3 pb-4 lg:pb-0 scrollbar-hide snap-x snap-mandatory">
                        {CATEGORIES.map((cat, idx) => {
                            const IconComponent = CATEGORY_ICONS[cat.slug] || Sparkles;
                            return (
                                <Link 
                                    key={cat.name} 
                                    href={
                                        cat.slug === "image-invite" ? "/digital-invites/image" :
                                        cat.slug === "video-invite" ? "/digital-invites/video" :
                                        cat.slug === "website-invite" ? "/digital-invites/website" :
                                        `/catalog?category=${encodeURIComponent((cat as any).dbName || cat.name)}`
                                    }
                                    className="flex flex-col items-center shrink-0 snap-center group"
                                >
                                    <motion.div
                                        className="flex flex-col items-center"
                                        initial={isDesktop ? undefined : { y: 35, opacity: 0 }}
                                        whileInView={isDesktop ? undefined : { y: 0, opacity: 1 }}
                                        viewport={{ once: true, amount: 0.1 }}
                                        transition={{ 
                                            type: "tween", 
                                            ease: "easeOut",
                                            duration: 0.45, 
                                            delay: idx * 0.04
                                        }}
                                    >
                                        {/* Icon Circle with Hover Translation */}
                                        <motion.div 
                                            className="w-[72px] h-[72px] md:w-[92px] md:h-[92px] rounded-full flex items-center justify-center border-2 category-icon-circle shadow-md"
                                            whileHover={{ 
                                                y: -6,
                                                scale: 1.03
                                            }}
                                            whileTap={{ scale: 0.97 }}
                                            transition={{ 
                                                type: "tween", 
                                                ease: "easeOut",
                                                duration: 0.25
                                            }}
                                        >
                                            <IconComponent className="w-7 h-7 md:w-9 md:h-9 transition-transform duration-300" strokeWidth={1.2} />
                                        </motion.div>
                                        <span className="text-[10px] md:text-[11px] font-semibold text-slate-700 group-hover:text-[#A38760] mt-3 transition-colors duration-300 text-center max-w-[110px] leading-tight">
                                            {cat.name}
                                        </span>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 2. Hero Slider (Ken Burns effect as card) */}
            <section className="py-6 bg-transparent">
                <div className="site-container">
                    <div className="h-[450px] md:h-[600px] w-full relative overflow-hidden bg-slate-900 rounded-[24px] md:rounded-[32px] shadow-lg">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={heroIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8 }}
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
                                            transition={{ delay: 0.3 }}
                                            className="block text-[11px] font-medium text-white uppercase tracking-[0.22em] font-dmsans"
                                        >
                                            {heroSlides[heroIndex].eyebrow}
                                        </motion.span>
                                        
                                        <motion.h1 
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="text-3xl md:text-5xl lg:text-6xl text-white font-italiana font-normal leading-tight tracking-wide max-w-4xl mx-auto"
                                        >
                                            {heroSlides[heroIndex].title}
                                        </motion.h1>

                                        <motion.div 
                                            initial={{ y: 15, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.5 }}
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

                        {/* Navigation Arrows */}
                        <button 
                            onClick={handlePrevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-slate-800 flex items-center justify-center transition-all duration-300 shadow-md hover:scale-105 z-30 cursor-pointer"
                            aria-label="Previous slide"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <button 
                            onClick={handleNextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-slate-800 flex items-center justify-center transition-all duration-300 shadow-md hover:scale-105 z-30 cursor-pointer"
                            aria-label="Next slide"
                        >
                            <ArrowRight size={18} />
                        </button>

                        {/* Pagination Dots */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
                            {heroSlides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setHeroIndex(idx)}
                                    className="relative w-5 h-5 flex items-center justify-center focus:outline-none"
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
                    </div>
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
                                className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group iz-animate"
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
                        <span>NEW · JUST IN · FRESH FROM THE STUDIO · NEW · JUST IN · FRESH FROM THE STUDIO · NEW · JUST IN · FRESH FROM THE STUDIO · NEW · JUST IN · FRESH FROM THE STUDIO · NEW · JUST IN · FRESH FROM THE STUDIO · NEW · JUST IN · FRESH FROM THE STUDIO ·&nbsp;</span>
                        <span>NEW · JUST IN · FRESH FROM THE STUDIO · NEW · JUST IN · FRESH FROM THE STUDIO · NEW · JUST IN · FRESH FROM THE STUDIO · NEW · JUST IN · FRESH FROM THE STUDIO · NEW · JUST IN · FRESH FROM THE STUDIO · NEW · JUST IN · FRESH FROM THE STUDIO ·&nbsp;</span>
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
                                className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group iz-animate"
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
                                    <span className="absolute top-3 left-3 bg-[#ae7fcb] text-white text-[8px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full shadow-sm">
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
                                    "p-6 rounded-2xl border flex flex-col justify-between min-h-[160px] relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group iz-animate",
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



            {/* 10. Trending on Instagram */}
            <section className="py-16 bg-[#FAF8F5]">
                <div className="site-container">
                    <div className="text-center mb-10 iz-animate">
                        <span className="text-[10px] font-bold tracking-[0.15em] text-[#6E4B8B] uppercase">TRENDING NOW</span>
                        <h2 className="text-2xl md:text-3xl font-italiana font-normal text-slate-800 mt-2">Invitations Worth Talking About</h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {bestSellers.map((product, idx) => (
                            <Link 
                                key={product._id} 
                                href={`/catalog/${product.slug}`}
                                className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative border border-slate-100 group shadow-sm hover:shadow-md transition-all duration-300 iz-animate block"
                                style={{ transitionDelay: `${idx * 60}ms` }}
                            >
                                <img src={product.images[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 text-center">
                                    <div className="text-white space-y-1 scale-95 group-hover:scale-100 transition-transform duration-300">
                                        <span className="text-[11px] font-bold tracking-wider uppercase block leading-tight">{product.name}</span>
                                        <span className="text-[9px] font-medium tracking-widest uppercase block opacity-85 mt-1">View Design →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 11. Zubizo in Numbers */}
            <section ref={numbersSectionRef} className="py-20 bg-gradient-to-b from-[#F5F1FD] to-[#FAF8F5] border-y border-slate-100">
                <div className="site-container">
                    <div className="text-center mb-12 relative max-w-xl mx-auto iz-animate">
                        <span className="text-[10px] font-bold tracking-[0.15em] text-[#ae7fcb] uppercase">OUR IMPACT</span>
                        <h2 className="text-2xl md:text-3xl font-italiana font-normal text-slate-800 mt-2">Zubizo in Numbers</h2>
                        <p className="text-slate-500 text-xs font-medium mt-2 leading-relaxed">
                            Every number represents a family's trust, a celebration honoured, and a memory made forever.
                        </p>
                        {/* Decorative circle with dot */}
                        <div className="absolute -right-8 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-6 h-6 rounded-full border border-[#ae7fcb]/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#ae7fcb]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
                        {numbers.map((num, idx) => {
                            const config = NUMBER_CARDS_CONFIG[idx];
                            const IconComponent = config.icon;
                            return (
                                <div 
                                    key={num.label} 
                                    className="bg-white border border-slate-100/80 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group iz-animate"
                                    style={{ transitionDelay: `${idx * 80}ms` }}
                                >
                                    {/* Icon container */}
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110", config.iconBg)}>
                                        <IconComponent size={20} className={config.iconColor} strokeWidth={1.5} />
                                    </div>
                                    {/* Number */}
                                    <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 font-sans tracking-tight">
                                        {num.value.toLocaleString('en-IN')}+
                                    </h3>
                                    {/* Label */}
                                    <h4 className="text-[9px] font-bold text-slate-800 tracking-wider uppercase mt-2">
                                        {num.label}
                                    </h4>
                                    {/* Sub-label */}
                                    <p className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed">
                                        {config.sublabel}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 12. How It Works */}
            <section className="py-20 bg-white border-b border-slate-100">
                <div className="site-container">
                    <div className="text-center mb-16 iz-animate">
                        <span className="text-[10px] font-bold tracking-[0.15em] text-[#6E4B8B] uppercase">HOW IT WORKS</span>
                        <h2 className="text-2xl md:text-3xl font-italiana font-normal text-slate-800 mt-2">Simple. Elegant. Personal.</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative max-w-5xl mx-auto">
                        {/* Connecting Line (Dashed SVGs for Desktop) */}
                        <div className="hidden md:block absolute top-[35px] left-[15%] right-[15%] h-0.5 z-0 pointer-events-none">
                            <svg className="w-full h-full text-slate-200 stroke-current" strokeDasharray="5,5">
                                <line x1="0" y1="0" x2="100%" y2="0" strokeWidth="1.5" />
                            </svg>
                        </div>

                        {[
                            { 
                                icon: BookOpen, 
                                title: "Explore Catalogue", 
                                desc: "Browse our curated collection of premium handcrafted designs and find the one that resonates with your vision.",
                                actionText: "BROWSE DESIGNS",
                                link: "/catalog"
                            },
                            { 
                                icon: MessageCircle, 
                                title: "Order via WhatsApp", 
                                desc: "Reach out to us directly on WhatsApp with your chosen design. We'll guide you through personalisation options.",
                                actionText: "CHAT WITH US",
                                link: "https://wa.me/919626671060"
                            },
                            { 
                                icon: Check, 
                                title: "Confirm & Payment", 
                                desc: "Make a 50% advance payment to get started. Once confirmed, our team begins crafting your personalised design.",
                                actionText: "GET STARTED",
                                link: "/catalog"
                            }
                        ].map((item, idx) => {
                            const IconComponent = item.icon;
                            return (
                                <div key={item.title} className="text-center space-y-4 relative z-10 iz-animate group" style={{ transitionDelay: `${idx * 100}ms` }}>
                                    {/* Icon Circle */}
                                    <div className="relative w-[70px] h-[70px] rounded-full bg-[#EDE8F6]/50 border border-[#ae7fcb]/15 flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform duration-300">
                                        <IconComponent size={24} className="text-[#6E4B8B]" strokeWidth={1.5} />
                                        {/* Step number badge */}
                                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C5A880] text-white flex items-center justify-center text-[9px] font-bold shadow-sm">
                                            {idx + 1}
                                        </div>
                                    </div>
                                    {/* Title */}
                                    <h3 className="font-italiana font-normal text-slate-800 text-lg md:text-xl mt-4">{item.title}</h3>
                                    {/* Description */}
                                    <p className="text-xs text-slate-500 leading-relaxed max-w-[250px] mx-auto font-light">{item.desc}</p>
                                    {/* Action Link */}
                                    <div>
                                        {item.link.startsWith('http') ? (
                                            <a 
                                                href={item.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="inline-block text-[10px] font-bold tracking-widest text-[#6E4B8B] hover:text-[#ae7fcb] uppercase border-b border-[#6E4B8B] pb-0.5 mt-3 transition-all duration-300 hover:-translate-y-0.5"
                                            >
                                                {item.actionText}
                                            </a>
                                        ) : (
                                            <Link 
                                                href={item.link} 
                                                className="inline-block text-[10px] font-bold tracking-widest text-[#6E4B8B] hover:text-[#ae7fcb] uppercase border-b border-[#6E4B8B] pb-0.5 mt-3 transition-all duration-300 hover:-translate-y-0.5"
                                            >
                                                {item.actionText}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
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
                                className="bg-white p-6 rounded-2xl border border-[#EDE8F6] shadow-sm flex flex-col justify-between space-y-4 iz-animate"
                                style={{ transitionDelay: `${idx * 80}ms` }}
                            >
                                <div className="space-y-2">
                                    {/* Star rating placeholder */}
                                    <div className="flex text-amber-400 gap-0.5 text-sm">★★★★★</div>
                                    <p className="text-slate-600 text-[11px] italic leading-relaxed font-light">"{test.quote}"</p>
                                </div>
                                <div className="flex items-center gap-2 border-t border-[#EDE8F6]/30 pt-3">
                                    <div className="w-8 h-8 rounded-full bg-[#EDE8F6] flex items-center justify-center font-bold text-[#ae7fcb] text-xs shadow-inner uppercase">
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
            <LuxuryFooter />
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
                    <WhatsAppIcon size={24} className="text-white" />
                </a>
            </div>
        </div>
    );
}
