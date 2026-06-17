"use client";

import { motion } from "framer-motion";
import { Image, Play, Layout, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const categoryCards = [
  {
    id: "image",
    title: "Image E-Invites",
    description: "High-resolution artisanal designs ready for WhatsApp sharing.",
    icon: Image,
    href: "/digital-invites/image",
    accent: "bg-[#EDE8F6]",
    textColor: "text-[#6E4B8B]",
    isPremium: true,
    label: null
  },
  {
    id: "website",
    title: "Website Invites",
    description: "Interactive, mobile-first websites with RSVP and more.",
    icon: Layout,
    href: "/digital-invites/website",
    accent: "bg-[#EDE8F6]",
    textColor: "text-[#6E4B8B]",
    isPremium: true,
    label: null
  }
];

export const CategoryNavigation = () => {
  return (
    <section id="categories" className="py-16 bg-white">
      <div className="site-container">
        <div className="text-center mb-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-italiana font-normal text-slate-800 mb-4">Choose Your Format</h2>
            <p className="text-slate-500 font-light max-w-xl mx-auto">
              Select the perfect digital experience for your wedding celebration.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 max-w-4xl mx-auto">
          {categoryCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative group h-full"
            >
              {card.label && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <span className="px-4 py-1.5 bg-[#6E4B8B] text-white text-[10px] font-bold tracking-[0.2em] rounded-full shadow-lg">
                    {card.label}
                  </span>
                </div>
              )}
              
              <Link 
                href={card.href}
                className={cn(
                  "flex flex-col h-full p-10 rounded-[40px] border border-charcoal/5 transition-all duration-500 hover:shadow-2xl hover:shadow-[#ae7fcb]/10 hover:-translate-y-2",
                  card.isPremium ? "bg-gradient-to-br from-white to-[#FAF8F5] ring-2 ring-[#ae7fcb]/20" : "bg-white"
                )}
              >
                <div className={cn(
                  "w-16 h-16 rounded-3xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110",
                  card.accent
                )}>
                  <card.icon size={28} className={card.textColor} />
                </div>
                
                <h3 className="text-2xl font-italiana font-normal text-slate-800 mb-4">{card.title}</h3>
                <p className="text-slate-550 text-sm leading-relaxed mb-10 flex-grow font-light">
                  {card.description}
                </p>
                
                <div className="flex items-center gap-2 text-[#6E4B8B] font-bold text-xs uppercase tracking-widest mt-auto">
                  Explore Now
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
