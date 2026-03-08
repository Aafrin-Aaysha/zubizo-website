"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";
import { Shield, FileText, Truck, RefreshCcw, Loader2 } from "lucide-react";

const PolicySection = ({ title, icon: Icon, content }: { title: string; icon: any; content: string }) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-16 last:mb-0"
    >
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-lavender/5 flex items-center justify-center text-lavender border border-lavender/10">
                <Icon size={24} />
            </div>
            <h2 className="text-3xl font-bold font-serif text-charcoal">{title}</h2>
        </div>
        <div className="prose prose-neutral max-w-none">
            {content ? (
                <div className="text-neutral-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                    {content}
                </div>
            ) : (
                <p className="text-neutral-400 italic text-sm">Content coming soon...</p>
            )}
        </div>
    </motion.section>
);

export default function PoliciesPage() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                const data = await res.json();
                if (res.ok) setSettings(data);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-lavender" size={40} />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <LuxuryNavbar />

            {/* Hero Section */}
            <section className="pt-40 pb-20 bg-white border-b border-charcoal/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <span className="text-lavender font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">
                        LEGAL & TRUST
                    </span>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-charcoal font-serif mb-6 italic">
                        Our Policies
                    </h1>
                    <p className="text-neutral-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed uppercase tracking-widest font-bold">
                        Transparency and trust at the heart of Zubizo.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <PolicySection
                        title="Privacy Policy"
                        icon={Shield}
                        content={settings?.policyContent}
                    />
                    <PolicySection
                        title="Terms & Conditions"
                        icon={FileText}
                        content={settings?.termsContent}
                    />
                    <PolicySection
                        title="Shipping Policy"
                        icon={Truck}
                        content={settings?.shippingPolicyContent}
                    />
                    <PolicySection
                        title="Refund Policy"
                        icon={RefreshCcw}
                        content={settings?.refundPolicyContent}
                    />
                </div>
            </section>

            <LuxuryFooter />
        </main>
    );
}
