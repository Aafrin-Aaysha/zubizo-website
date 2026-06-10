"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Instagram } from "lucide-react";
import { LogoIcon } from "@/components/ui/logo-icon";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

export default function ComingSoonPage() {
    const waNumber = "918124548133";
    const instagramUrl = "https://instagram.com/zubizo.art";
    const phoneNumber = "+91 81245 48133";
    const addressDetails = "SS Arcade, 3F, Convent Road, Cantonment, Trichy 620001";

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
        }
    };

    return (
        <main className="min-h-screen lg:h-screen lg:max-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 md:p-8 relative overflow-x-hidden overflow-y-auto lg:overflow-hidden font-dmsans">
            {/* Background luxury gradient circles */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#EDE8F6]/40 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#EDE8F6]/30 blur-[100px] pointer-events-none" />

            <motion.div
                className="max-w-5xl w-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 relative z-10 py-6 lg:py-0"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Left Column: Brand Info & Call to Actions */}
                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8 max-w-xl">
                    {/* Logo and Branding Header */}
                    <motion.div className="flex flex-col lg:flex-row items-center gap-3" variants={itemVariants}>
                        <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border border-[#ae7fcb]/20 shrink-0">
                            <LogoIcon size={28} className="text-[#ae7fcb]" />
                        </div>
                        <span 
                            className="text-3xl md:text-4xl font-semibold italic text-[#ae7fcb] tracking-wide mt-1 lg:mt-0"
                            style={{ fontFamily: 'var(--font-fraunces), serif' }}
                        >
                            Zubizo
                        </span>
                    </motion.div>

                    {/* Main Heading & Tagline */}
                    <motion.div className="space-y-3" variants={itemVariants}>
                        <p 
                            className="text-3xl md:text-4xl font-normal text-slate-800 tracking-tight leading-tight"
                            style={{ fontFamily: 'var(--font-italiana), serif' }}
                        >
                            Crafting Something Beautiful
                        </p>
                        <div className="w-16 h-0.5 bg-[#ae7fcb]/30 rounded-full mx-auto lg:mx-0" />
                        <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-md">
                            Our premium digital experience is currently under construction. Meanwhile, we remain fully open for custom invitation designs and bespoke stationery commissions.
                        </p>
                    </motion.div>

                    {/* Primary WhatsApp / Instagram Contact CTAs */}
                    <motion.div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full" variants={itemVariants}>
                        <a
                            href={`https://wa.me/${waNumber}?text=Hello%20Zubizo%2C%20I'm%20interested%20in%20enquiring%20about%20your%20custom%20invitations.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-full transition-all shadow-lg shadow-green-100 hover:shadow-green-200 active:scale-98"
                        >
                            <WhatsAppIcon size={18} className="text-white" />
                            <span>Chat on WhatsApp</span>
                        </a>
                        
                        <a
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-full border border-slate-200 transition-all shadow-md active:scale-98"
                        >
                            <Instagram size={18} className="text-pink-600" />
                            <span>Visit Instagram</span>
                        </a>
                    </motion.div>
                </div>

                {/* Right Column: Studio Contact Details Card */}
                <div className="w-full max-w-md lg:max-w-lg">
                    <motion.div 
                        className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 md:p-8 border border-[#ae7fcb]/10 shadow-luxury space-y-5 text-left"
                        variants={itemVariants}
                    >
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 font-dmsans">
                            Zubizo Studio Contacts
                        </p>

                        <div className="space-y-4">
                            {/* Address */}
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-2 rounded-lg bg-[#EDE8F6]/60 text-[#6E4B8B] shrink-0">
                                    <MapPin size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-dmsans">Studio Address</p>
                                    <p className="text-slate-650 text-xs md:text-sm leading-relaxed mt-0.5 font-light">
                                        {addressDetails}
                                    </p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-2 rounded-lg bg-[#EDE8F6]/60 text-[#6E4B8B] shrink-0">
                                    <Phone size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-dmsans">Call or WhatsApp</p>
                                    <p className="text-slate-650 text-xs md:text-sm leading-relaxed mt-0.5 font-light">
                                        <a href={`tel:${phoneNumber.replace(/\s+/g, '')}`} className="hover:text-[#6E4B8B] transition-colors">
                                            {phoneNumber}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </main>
    );
}
