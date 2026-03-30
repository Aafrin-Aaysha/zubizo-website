"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getWhatsAppNumber, sanitizeWhatsAppNumber } from "@/lib/utils";

export const FinalCTA = () => {
    const waNumber = sanitizeWhatsAppNumber(getWhatsAppNumber());
    const waLink = `https://wa.me/${waNumber}?text=Hi%20Zubizo%2C%20I'm%20interested%20in%20your%20Digital%20Invitations.%20Can%20you%20help%20me%20choose%20the%20best%20one%3F`;

  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <div className="site-container relative z-10 text-center px-4">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           viewport={{ once: true }}
           className="max-w-4xl mx-auto py-20 px-8 rounded-[60px] bg-gradient-to-br from-lavender/5 via-white to-blush-rose/5 border border-lavender/10 shadow-sm"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-lavender bg-white/60 backdrop-blur-sm border border-lavender/10 rounded-full shadow-sm">
            Begin Your Journey
          </span>
          <h2 className="text-4xl md:text-6xl font-serif text-charcoal mb-8 leading-tight">
            Make your wedding invite <br />
            <span className="italic text-lavender">unforgettable</span>
          </h2>
          <p className="text-lg text-charcoal/50 font-medium mb-12 max-w-xl mx-auto">
            Choose the perfect digital format and start sharing your beautiful news today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              href="/catalog?category=Digital+E-Invite" 
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-lavender text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-lavender/90 transition-all shadow-lg active:scale-95"
            >
              Get Started Now
              <ArrowRight size={18} />
            </Link>
            <a 
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#25D366] border border-[#25D366]/20 rounded-full font-bold text-sm uppercase tracking-widest hover:border-[#25D366]/50 transition-all shadow-sm active:scale-95"
            >
              <MessageCircle size={18} fill="currentColor" className="text-white" />
              Chat on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decorative patterns */}
      <div className="absolute top-1/2 left-0 w-32 h-32 border-4 border-lavender/20 rounded-full -translate-x-1/2 -z-0 opacity-20" />
      <div className="absolute bottom-1/2 right-0 w-48 h-48 border-4 border-soft-gold/20 rounded-full translate-x-1/2 -z-0 opacity-20" />
    </section>
  );
};
