"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'image-invites', label: 'Image Invites' },
  { id: 'video-invites', label: 'Video Invites' },
  { id: 'website-invites', label: 'Website Invites' },
  { id: 'pricing', label: 'Pricing' },
];

export const SectionNavigation = () => {
    const { scrollY } = useScroll();
    const [activeSection, setActiveSection] = React.useState("");

    // Only show after hero (e.g. 600px scroll)
    const opacity = useTransform(scrollY, [400, 600], [0, 1]);
    const translateY = useTransform(scrollY, [400, 600], [-20, 0]);

    React.useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.scrollY + 150;
            for (const section of sections) {
                const element = document.getElementById(section.id);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = element.offsetTop - 100;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }
    };

    return (
        <motion.div 
            style={{ opacity, y: translateY }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-40 hidden md:block"
        >
            <div className="bg-white/80 backdrop-blur-md border border-lavender/20 px-8 py-3 rounded-full shadow-luxury flex items-center gap-8">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => scrollTo(section.id)}
                        className={cn(
                            "text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                            activeSection === section.id ? "text-lavender scale-110" : "text-charcoal/40 hover:text-lavender"
                        )}
                    >
                        {section.label}
                    </button>
                ))}
            </div>
        </motion.div>
    );
};
