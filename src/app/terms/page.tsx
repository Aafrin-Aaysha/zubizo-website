"use client";

import * as React from "react";
import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";
import { motion } from "framer-motion";

export default function TermsPage() {
    const [settings, setSettings] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchSettings = async () => {
            const res = await fetch("/api/settings");
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        };
        fetchSettings();
    }, []);

    return (
        <main className="min-h-screen bg-white">
            <LuxuryNavbar />
            <div className="pt-40 pb-24 px-8 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-lavender font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">
                        Legal & Compliance
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black font-serif text-charcoal mb-16 tracking-tight">
                        Terms & Policy
                    </h1>

                    <div className="space-y-16">
                        <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-neutral-100">
                            <h2 className="text-2xl font-black text-charcoal mb-6 font-serif uppercase tracking-wider border-b border-lavender/10 pb-4">Terms of Service</h2>
                            <div
                                className="text-gray-600 leading-relaxed text-sm md:text-base prose prose-neutral max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_a]:text-lavender [&_a]:underline"
                                dangerouslySetInnerHTML={{ __html: settings?.termsContent || settings?.terms || "Loading terms..." }}
                            />
                        </section>

                        <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-neutral-100">
                            <h2 className="text-2xl font-black text-charcoal mb-6 font-serif uppercase tracking-wider border-b border-lavender/10 pb-4">Privacy Policy</h2>
                            <div
                                className="text-gray-600 leading-relaxed text-sm md:text-base prose prose-neutral max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_a]:text-lavender [&_a]:underline"
                                dangerouslySetInnerHTML={{ __html: settings?.policyContent || "Our privacy policy ensures your data is protected and used only for order processing and communication." }}
                            />
                        </section>
                    </div>
                </motion.div>
            </div>
            <LuxuryFooter />
        </main>
    );
}
