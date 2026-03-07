"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { scrollY } = useScroll();

    const backgroundColor = useTransform(
        scrollY,
        [0, 100],
        ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.8)"]
    );

    const backdropBlur = useTransform(
        scrollY,
        [0, 100],
        ["blur(0px)", "blur(12px)"]
    );

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Catalogue", href: "/catalog" },
        { name: "Terms & Policy", href: "/terms" },
        { name: "Contact", href: "/#contact" },
    ];

    const [settings, setSettings] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings', { cache: 'no-store' });
                const data = await res.json();
                if (res.ok) setSettings(data);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <motion.nav
            style={{ backgroundColor }}
            className="fixed top-0 z-50 w-full border-b border-transparent transition-colors duration-300 hover:border-soft-grey"
        >
            <motion.div
                style={{ backdropFilter: backdropBlur }}
                className="absolute inset-0 -z-10"
            />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <div className="flex-shrink-0">
                        <Link href="/" className="group flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-lavender/10 bg-lavender/5 flex items-center justify-center">
                                {settings?.logoUrl ? (
                                    <Image
                                        src={settings.logoUrl}
                                        alt="Zubizo Logo"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="text-xs font-bold text-lavender font-serif">Z</span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold tracking-tighter text-charcoal transition-colors group-hover:text-lavender font-serif">
                                    ZUBIZO
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.3em] text-charcoal/60 -mt-1 font-sans">
                                    Invitation Stationary
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-medium text-charcoal/80 transition-colors hover:text-lavender"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 text-charcoal hover:text-lavender"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-white/95 backdrop-blur-lg border-b border-soft-grey"
                >
                    <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3 text-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block px-3 py-4 text-base font-medium text-charcoal hover:bg-soft-grey hover:text-lavender"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};

export { Navbar };
