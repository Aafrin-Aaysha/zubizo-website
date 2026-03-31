"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const pricingPlans = [
  {
    name: "Image Invite",
    price: "499",
    description: "Perfect for quick and elegant announcements.",
    features: [
      "HD PNG / JPEG / PDF",
      "WhatsApp & Social Ready",
      "24 Hour Delivery",
      "Premium Artisanal Design",
      "Personalized Content"
    ],
    cta: "Choose Image Invite",
    href: "/digital-invites/image",
    isRecommended: false
  },
  {
    name: "Website Invite",
    price: "3999",
    description: "The complete interactive wedding experience.",
    features: [
      "Full Custom Website",
      "Interactive RSVP System",
      "Google Maps Integration",
      "Love Story & Gallery",
      "99.9% Uptime Hosting",
      "Mobile First Design",
      "Message Wall for Guests"
    ],
    cta: "Create My Website",
    href: "/digital-invites/website",
    isRecommended: false
  },
  {
    name: "Video Invite",
    price: "999",
    description: "Cinematic reveal with custom animation.",
    features: [
      "Full HD MP4 Format",
      "Custom Background Music",
      "Instagram Reel Ready",
      "Premium Logo Animation",
      "Custom Couple Names"
    ],
    cta: "Choose Video Invite",
    href: "/digital-invites/video",
    isRecommended: false
  }
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="site-container">
        <div className="text-center mb-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">Timeless Value</h2>
            <p className="text-charcoal/50 font-medium max-w-xl mx-auto">
              Luxury experiences designed to fit every celebration.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {pricingPlans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              className={cn(
                "relative group flex flex-col h-full p-8 md:p-12 rounded-[50px] transition-all duration-500",
                "bg-pearl-white border border-charcoal/5 text-charcoal"
              )}
            >
              <div className="mb-10">
                <h3 className={cn(
                  "text-2xl font-serif mb-2",
                  "text-charcoal"
                )}>
                  {plan.name}
                </h3>
                <p className={cn(
                  "text-xs font-medium",
                  "text-charcoal/50"
                )}>
                  {plan.description}
                </p>
              </div>

              <div className="flex items-baseline gap-1 mb-10">
                <span className={cn(
                  "text-sm font-bold",
                  "text-lavender"
                )}>₹</span>
                <span className="text-5xl font-black tracking-tight">{plan.price}</span>
              </div>

              <div className="flex-grow space-y-4 mb-12">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                      "bg-lavender/10 text-lavender"
                    )}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      "text-charcoal/70"
                    )}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Link 
                href={plan.href}
                className={cn(
                  "flex items-center justify-center gap-2 w-full py-5 rounded-full font-bold text-xs uppercase tracking-[0.15em] transition-all duration-300 active:scale-95",
                  "bg-white text-charcoal border border-charcoal/10 hover:border-lavender/40 shadow-sm"
                )}
              >
                {plan.cta}
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
