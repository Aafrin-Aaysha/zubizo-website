"use client";

import * as React from "react";
import Link from "next/link";
import { Phone, Instagram } from "lucide-react";
import { LogoIcon } from "@/components/ui/logo-icon";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { LeadCaptureModal, LeadData } from "@/components/ui/LeadCaptureModal";
import { getWhatsAppNumber, sanitizeWhatsAppNumber } from "@/lib/utils";

const Footer = () => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const handleWhatsAppClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (data: LeadData) => {
        try {
            await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: data.name,
                    phone: data.phone,
                    source: 'footer_whatsapp',
                    status: 'New',
                    notes: 'Customer clicked on footer WhatsApp link'
                })
            });
        } catch (error) {
            console.error("Inquiry logging failed", error);
        }

        const waNumber = sanitizeWhatsAppNumber(getWhatsAppNumber());
        const message = `*Inquiry from Website*

Hello Zubizo,

My name is ${data.name}.
My contact number is ${data.phone}.

I would like to inquire about your services.`;
        
        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
        setIsModalOpen(false);
    };

    return (
        <footer id="contact" className="bg-pearl-white pt-20 pb-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Thin Lavender Divider */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-lavender/30 to-transparent w-full mb-16" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="group inline-flex flex-col items-start gap-4">
                            <div className="p-3 bg-lavender/5 rounded-xl text-charcoal group-hover:text-lavender transition-colors">
                                <LogoIcon size={48} />
                            </div>
                            <span className="text-[28px] text-lavender font-extrabold italic" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                                Zubizo
                            </span>
                        </Link>
                        <p className="text-sm text-charcoal/60 font-medium max-w-xs leading-relaxed font-sans">
                            Premium handcrafted invitation designs with elegance.
                        </p>
                    </div>

                    {/* Quick Links Column */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-charcoal mb-8">Navigation</h4>
                            <ul className="space-y-4">
                                {[
                                    { name: "Catalogue", href: "/catalog" },
                                    { name: "Our Story", href: "/#about" },
                                    { name: "Contact", href: "/#contact" },
                                ].map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-[10px] text-charcoal/50 hover:text-lavender transition-colors font-bold uppercase tracking-widest"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-charcoal mb-8">Legal</h4>
                            <ul className="space-y-4">
                                {[
                                    { name: "Privacy Policy", href: "/policies" },
                                    { name: "Terms & Conditions", href: "/policies" },
                                ].map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-[10px] text-charcoal/50 hover:text-lavender transition-colors font-bold uppercase tracking-widest"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Contact Summary Column */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-charcoal mb-8">Connect</h4>
                        <ul className="space-y-5">
                            <li>
                                <a href="tel:+918124548133" className="flex items-center gap-3 text-sm text-charcoal/70 font-medium group transition-all">
                                    <div className="w-8 h-8 rounded-lg bg-lavender/5 flex items-center justify-center text-lavender group-hover:bg-lavender group-hover:text-white transition-all">
                                        <Phone size={14} strokeWidth={1.5} />
                                    </div>
                                    +91 81245 48133
                                </a>
                            </li>
                            <li>
                                <button onClick={handleWhatsAppClick} className="flex items-center gap-3 text-sm text-charcoal/70 font-medium group transition-all">
                                    <div className="w-8 h-8 rounded-lg bg-lavender/5 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all">
                                        <WhatsAppIcon size={14} />
                                    </div>
                                    +91 90929 81748
                                </button>
                            </li>
                            <li>
                                <a href="https://www.instagram.com/zubizo.art?igsh=MWxkdWcwbjdhMDE2bw==" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-charcoal/70 font-medium group transition-all">
                                    <div className="w-8 h-8 rounded-lg bg-lavender/5 flex items-center justify-center text-lavender group-hover:bg-lavender group-hover:text-white transition-all">
                                        <Instagram size={14} strokeWidth={1.5} />
                                    </div>
                                    @zubizo.art
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-charcoal/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                    <p className="text-[10px] uppercase tracking-widest text-charcoal/40 font-bold">
                        © 2026 Zubizo
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-charcoal/30 font-bold">
                        Handcrafted with Love In India
                    </p>
                </div>
            </div>

            <LeadCaptureModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />
        </footer>
    );
};

export { Footer as LuxuryFooter };
