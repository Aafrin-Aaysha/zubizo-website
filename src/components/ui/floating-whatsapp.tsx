"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { getWhatsAppNumber, sanitizeWhatsAppNumber } from '@/lib/utils';
import { LeadCaptureModal, LeadData } from './LeadCaptureModal';

export const FloatingWhatsApp = () => {
    const [showTooltip, setShowTooltip] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setShowTooltip(true), 5000);
        return () => clearTimeout(timer);
    }, []);

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
                    source: 'floating_whatsapp',
                    status: 'New',
                    notes: 'Customer clicked on floating WhatsApp button'
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

I'm interested in your Digital Invitations. Can you help me choose the best one?`;
        
        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4 pointer-events-none">
                <AnimatePresence>
                    {showTooltip && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, x: 20 }}
                            className="bg-white p-4 rounded-2xl shadow-2xl border border-lavender/10 max-w-[200px] pointer-events-auto relative mb-2"
                        >
                            <button 
                                onClick={() => setShowTooltip(false)}
                                className="absolute top-2 right-2 text-charcoal/30 hover:text-charcoal transition-colors"
                            >
                                <X size={12} />
                            </button>
                            <p className="text-[10px] font-black uppercase tracking-widest text-lavender mb-1">Need help?</p>
                            <p className="text-xs font-semibold text-charcoal/70 leading-relaxed">Chat with our invitation experts on WhatsApp!</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={handleWhatsAppClick}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-[0_10px_30px_-5px_rgba(37,211,102,0.5)] pointer-events-auto transition-transform relative"
                >
                    <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-25" />
                    <MessageCircle size={32} fill="white" className="relative z-10" />
                </motion.button>
            </div>

            <LeadCaptureModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />
        </>
    );
};
