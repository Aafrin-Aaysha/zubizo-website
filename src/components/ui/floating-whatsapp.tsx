"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { getWhatsAppNumber, sanitizeWhatsAppNumber } from '@/lib/utils';

export const FloatingWhatsApp = () => {
    const [showTooltip, setShowTooltip] = React.useState(false);
    const waNumber = sanitizeWhatsAppNumber(getWhatsAppNumber());
    const waLink = `https://wa.me/${waNumber}?text=Hi%20Zubizo%2C%20I'm%20interested%20in%20your%20Digital%20Invitations.%20Can%20you%20help%20me%20choose%20the%20best%20one%3F`;

    React.useEffect(() => {
        const timer = setTimeout(() => setShowTooltip(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
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

            <motion.a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-[0_10px_30px_-5px_rgba(37,211,102,0.5)] pointer-events-auto transition-transform"
            >
                <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-25" />
                <MessageCircle size={32} fill="currentColor" className="relative z-10" />
            </motion.a>
        </div>
    );
};
