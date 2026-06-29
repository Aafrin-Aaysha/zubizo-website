"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";

export const DigitalInvitesHero = () => {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-br from-lavender/10 via-pearl-white to-blush-rose">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-lavender/10 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-soft-gold/10 rounded-full blur-[80px]" 
        />
      </div>

      <div className="site-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-[11px] font-bold uppercase tracking-[0.3em] text-[#6E4B8B] bg-white/60 backdrop-blur-sm border border-[#ae7fcb]/10 rounded-full shadow-sm">
              Artisanal Digital Experiences
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-italiana font-normal text-slate-800 leading-[0.9] mb-8 tracking-tight">
              Digital <br />
              <span className="italic text-[#ae7fcb]">Wedding Invitations</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-light max-w-2xl mx-auto mb-8 leading-relaxed">
              Elegant, interactive, and affordable invites tailored for your special day. 
              Handcrafted designs that bring your celebration to life in the digital realm.
            </p>
          </motion.div>

        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-pearl-white to-transparent pointer-events-none" />
    </section>
  );
};
