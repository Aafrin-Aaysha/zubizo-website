"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";

export const DigitalInvitesHero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-gradient-to-br from-soft-lilac via-pearl-white to-blush-rose">
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
            <span className="inline-block px-4 py-1.5 mb-6 text-[11px] font-black uppercase tracking-[0.3em] text-lavender bg-white/60 backdrop-blur-sm border border-lavender/10 rounded-full shadow-sm">
              Artisanal Digital Experiences
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-charcoal leading-[0.9] mb-8 tracking-tight">
              Digital <br />
              <span className="italic text-lavender">Wedding Invitations</span>
            </h1>
            <p className="text-lg md:text-xl text-charcoal/60 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
              Elegant, interactive, and affordable invites tailored for your special day. 
              Handcrafted designs that bring your celebration to life in the digital realm.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link 
              href="#categories" 
              className="group flex items-center gap-3 px-10 py-5 bg-lavender text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-lavender/90 transition-all shadow-lg shadow-lavender/20 active:scale-95"
            >
              Explore Designs
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#website-invites" 
              className="group flex items-center gap-3 px-10 py-5 bg-white text-charcoal border border-charcoal/5 rounded-full font-bold text-sm uppercase tracking-widest hover:border-lavender/30 transition-all shadow-sm active:scale-95"
            >
              <PlayCircle size={18} className="text-lavender" />
              View Demo
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-pearl-white to-transparent pointer-events-none" />
    </section>
  );
};
