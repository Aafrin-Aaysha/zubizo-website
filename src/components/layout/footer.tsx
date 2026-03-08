import * as React from "react";
import Link from "next/link";
import { Instagram, Phone } from "lucide-react";
import { LogoIcon } from "@/components/ui/logo-icon";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

const footerLinks = [
    { name: "Home", href: "/" },
    { name: "Catalogue", href: "/catalog" },
    { name: "About", href: "/#about" },
    { name: "Terms & Policies", href: "/terms" },
    { name: "Contact", href: "/#contact" },
];

const Footer = () => {
    return (
        <footer className="bg-pearl-white border-t border-lavender/10 pt-20 pb-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="group inline-flex flex-col items-start gap-4">
                            <div className="p-2 bg-lavender/5 rounded-xl text-charcoal group-hover:text-lavender transition-colors">
                                <LogoIcon size={32} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold tracking-tighter text-gray-900 transition-colors group-hover:text-lavender font-serif">
                                    ZUBIZO
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40 mt-1">
                                    Zubizo Invitation Studio
                                </span>
                            </div>
                        </Link>
                        <p className="text-sm text-gray-500 font-medium max-w-xs leading-relaxed">
                            Crafting timeless memories with premium stationery and bespoke invitation designs for life's most beautiful moments.
                        </p>
                    </div>

                    {/* Quick Links Column */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-8">Quick Links</h4>
                        <ul className="grid grid-cols-2 gap-x-8 gap-y-4">
                            {footerLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-500 hover:text-lavender transition-colors font-medium inline-block"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info Column */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-8">Contact Us</h4>
                        <ul className="space-y-5">
                            <li>
                                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-lavender">
                                        <Phone size={14} strokeWidth={1.5} />
                                    </div>
                                    +91 81245 48133
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#25D366]">
                                        <WhatsAppIcon size={14} />
                                    </div>
                                    +91 90929 81748
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-lavender">
                                        <Instagram size={14} strokeWidth={1.5} />
                                    </div>
                                    @zubizo._art
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-lavender/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-400 font-medium">
                        © 2026 Zubizo. All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-8">
                        <Link href="/terms" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-lavender font-bold transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-lavender font-bold transition-colors">
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export { Footer };
