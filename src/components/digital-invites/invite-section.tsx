"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import InviteCard from "./invite-card";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Feature {
  icon: any;
  label: string;
}

interface InviteSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  features: string[];
  designs: any[];
  categoryName: string;
  categoryPath: string;
  showVideoIcon?: boolean;
}

export const InviteSection = ({ 
  id, 
  title, 
  subtitle,
  features, 
  designs, 
  categoryName,
  categoryPath,
  showVideoIcon 
}: InviteSectionProps) => {
  return (
    <section id={id} className="py-24 bg-white border-b border-charcoal/5">
      <div className="site-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-serif text-charcoal mb-4 italic italic-lavender">{title}</h2>
            </motion.div>
          </div>
          
          
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
          {designs.slice(0, 8).map((design, idx) => (
            <InviteCard 
                key={design._id} 
                design={design} 
                showVideoIcon={showVideoIcon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
