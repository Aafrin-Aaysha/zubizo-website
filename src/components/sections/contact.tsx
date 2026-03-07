"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Instagram, ExternalLink } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

// Note: Data is now fetched dynamically from /api/settings.
// Fallback defaults below.
const DEFAULT_CONTACT = {
    address: {
        title: "Studio Address",
        line1: "SS ARCADE, No.3F 3rd Floor",
        line2: "Convent Rd, Melapudur",
        line3: "Sangillyandapuram",
        line4: "Tiruchirappalli, Tamil Nadu",
        mapsLink: "https://maps.app.goo.gl/KAcz1CHJkVSq5iEA7"
    },
    phone: "+91 81245 48133",
    whatsapp: "9092981748",
    instagram: "@zubizo._art",
    workingHours: [
        { day: "Monday – Saturday", time: "10:00 AM – 7:00 PM" },
        { day: "Sunday", time: "Closed" }
    ]
};

export const ContactSection = ({ data, styling, title, subtitle }: any) => {
    const [settings, setSettings] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        fetch("/api/settings")
            .then((r) => r.json())
            .then((data) => setSettings(data))
            .catch(() => setSettings({}))
            .finally(() => setIsLoading(false));
    }, []);

    const phone = settings?.phone || DEFAULT_CONTACT.phone;
    const whatsapp = settings?.whatsappNumber || DEFAULT_CONTACT.whatsapp;
    const address = settings?.address || `${DEFAULT_CONTACT.address.line1}\n${DEFAULT_CONTACT.address.line2}\n${DEFAULT_CONTACT.address.line3}`;
    const businessHours = settings?.businessHours || "Mon-Sat: 10AM-7PM";

    const waLink = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hi Zubizo, I would like to enquire about your invitation designs.")}`;

    return (
        <section
            id="contact"
            className="py-[120px] bg-soft-white relative overflow-hidden"
            style={{
                backgroundColor: styling?.backgroundColor || '#fafafa',
                padding: styling?.padding || '120px 0'
            }}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-20"
                    >
                        <span
                            className="text-lavender font-bold uppercase tracking-[0.4em] text-[10px] mb-6 block"
                            style={{ color: styling?.accentColor }}
                        >
                            {subtitle || "Connect With Us"}
                        </span>
                        <h2
                            className="text-4xl md:text-5xl font-bold text-gray-900 font-serif mb-4"
                            style={{ color: styling?.textColor }}
                        >
                            {title || "Luxury Invitation Studio"}
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            {data?.description || "We’d love to help you create something beautiful."}
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left Column - Address & Hours */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-10"
                    >
                        {/* Address Card */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100" style={{ borderRadius: styling?.borderRadius }}>
                            <div className="flex gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-lavender/10 flex items-center justify-center text-lavender shrink-0" style={{ color: styling?.accentColor, background: `${styling?.accentColor}15` }}>
                                    <MapPin size={24} strokeWidth={1.5} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[#8A8A8A] mb-1">Studio Address</p>
                                    <div className="font-sans text-[18px] text-[#1A1A1A] font-medium leading-relaxed whitespace-pre-line">
                                        {isLoading ? <div className="h-20 w-full bg-gray-100 animate-pulse rounded" /> : address}
                                    </div>
                                    <a
                                        href={DEFAULT_CONTACT.address.mapsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-sans inline-flex items-center gap-2 mt-6 text-sm font-medium text-[#ae7fcb]"
                                    >
                                        View on Google Maps
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Working Hours Card */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100" style={{ borderRadius: styling?.borderRadius }}>
                            <div className="flex gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-lavender/10 flex items-center justify-center text-lavender shrink-0" style={{ color: styling?.accentColor, background: `${styling?.accentColor}15` }}>
                                    <Clock size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[#8A8A8A] mb-1">Working Hours</p>
                                    <div className="font-sans text-[18px] text-[#1A1A1A] font-medium whitespace-pre-line">
                                        {isLoading ? <div className="h-10 w-40 bg-gray-100 animate-pulse rounded" /> : (businessHours || "Mon–Sat: 10AM–7PM")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Contact Channels */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        {/* Phone */}
                        <div className="flex items-center gap-6 p-6 rounded-3xl border border-gray-100 bg-white" style={{ borderRadius: styling?.borderRadius }}>
                            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center" style={{ color: styling?.accentColor }}>
                                <Phone size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[#8A8A8A] mb-1">Call Us</p>
                                <span className="font-sans text-[18px] font-medium text-[#1A1A1A]">
                                    {isLoading ? "..." : phone}
                                </span>
                            </div>
                        </div>

                        {/* WhatsApp */}
                        <div className="flex items-center gap-6 p-6 rounded-3xl border border-gray-100 bg-white" style={{ borderRadius: styling?.borderRadius }}>
                            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#25D366]">
                                <WhatsAppIcon size={24} />
                            </div>
                            <div className="flex-1">
                                <p className="font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[#8A8A8A] mb-1">WhatsApp</p>
                                <p className="font-sans text-[18px] font-medium text-[#1A1A1A] mb-4">{isLoading ? "..." : whatsapp}</p>
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-sans inline-flex items-center gap-3 px-6 py-3 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-xl font-medium"
                                >
                                    <WhatsAppIcon size={18} />
                                    Chat on WhatsApp
                                </a>
                            </div>
                        </div>

                        {/* Instagram */}
                        <div className="flex items-center gap-6 p-6 rounded-3xl border border-gray-100 bg-white" style={{ borderRadius: styling?.borderRadius }}>
                            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center" style={{ color: styling?.accentColor }}>
                                <Instagram size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[#8A8A8A] mb-1">Instagram</p>
                                <a
                                    href={settings?.instagramUrl || `https://www.instagram.com/${DEFAULT_CONTACT.instagram.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-sans text-[18px] font-medium text-[#1A1A1A]"
                                >
                                    {settings?.instagramUrl?.split('/').pop() || DEFAULT_CONTACT.instagram}
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
