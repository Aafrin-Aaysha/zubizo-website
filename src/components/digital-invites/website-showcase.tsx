"use client";

import { motion } from "framer-motion";
import { Check, Smartphone, MapPin, Heart, Image as ImageIcon, MessageSquare, ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Heart, title: "Love Story Timeline", desc: "Share your beautiful journey through an interactive timeline." },
  { icon: Smartphone, title: "RSVP System", desc: "Effortless guest management with real-time response tracking." },
  { icon: MapPin, title: "Google Maps Integration", desc: "Easy navigation for your guests to find the venue." },
  { icon: ImageIcon, title: "Interactive Gallery", desc: "High-resolution photo gallery of your pre-wedding moments." },
  { icon: MessageSquare, title: "Message Wall", desc: "Let your loved ones leave heartwarming notes and wishes." },
];

export const WebsiteShowcase = () => {
  return (
    <section id="website-invites" className="py-24 bg-gradient-to-br from-champagne-cream via-white to-soft-lilac/30 overflow-hidden">
      <div className="site-container">
        <div className="flex flex-col lg:flex-row items-center gap-16 px-4">
          
          {/* Left: Content */}
          <div className="flex-1 max-w-2xl text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-soft-gold bg-white border border-soft-gold/20 rounded-full shadow-sm">
                PREMIUM EXPERIENCE
              </div>
              <h2 className="text-5xl md:text-6xl font-serif text-charcoal leading-[1.1] mb-8">
                E-Website <br />
                <span className="italic text-lavender">Wedding Invitations</span>
              </h2>
              <p className="text-lg text-charcoal/60 font-medium mb-10 leading-relaxed">
                The ultimate digital experience. A bespoke, interactive website that tells your story and manages your celebration with modern elegance.
              </p>

            </motion.div>
          </div>

          {/* Right: Mockup */}
          <div className="flex-1 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative z-20"
            >
              {/* Phone Mockup Frame */}
              <div className="relative mx-auto w-[300px] h-[600px] bg-charcoal rounded-[50px] p-4 shadow-[0_50px_100px_-20px_rgba(174,127,203,0.3)] border-[8px] border-charcoal/10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-3 w-32 h-6 bg-charcoal rounded-full z-30" />
                <div className="w-full h-full bg-white rounded-[32px] overflow-hidden relative">
                   {/* Mockup Content Placeholder */}
                   <div className="absolute inset-0 bg-gradient-to-b from-lavender/20 to-white flex flex-col items-center justify-center p-8 text-center">
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-lavender mb-4">Sanjiv & Anjali</span>
                     <h3 className="text-3xl font-serif text-charcoal mb-4 italic">The <br/>Wedding</h3>
                     <div className="w-32 h-32 bg-white/60 backdrop-blur rounded-full mb-6 border border-lavender/20 flex items-center justify-center overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=200" alt="mockup" className="w-full h-full object-cover" />
                     </div>
                     <p className="text-[10px] text-charcoal/40 font-black uppercase tracking-widest mb-6">24th December 2026</p>
                     <div className="w-full h-10 bg-lavender text-white rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-widest cursor-pointer shadow-lg">RSVP Now</div>
                   </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 w-24 h-24 bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-white/40 flex items-center justify-center text-soft-gold"
              >
                 <Heart size={40} fill="currentColor" strokeWidth={0} />
              </motion.div>
              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-10 w-20 h-20 bg-white/80 backdrop-blur rounded-full shadow-xl border border-white/40 flex items-center justify-center text-lavender"
              >
                 <MapPin size={32} />
              </motion.div>
            </motion.div>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-lavender/5 rounded-full blur-[100px] -z-10" />
          </div>

        </div>
      </div>
    </section>
  );
};
