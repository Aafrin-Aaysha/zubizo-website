"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";

type SiteSettings = {
    phone?: string;
    email?: string;
    address?: string;
    businessHours?: string;
    whatsappNumber?: string;
};

export default function ContactPage() {
    const [settings, setSettings] = React.useState<SiteSettings | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        fetch("/api/settings")
            .then((r) => r.json())
            .then((data) => setSettings(data))
            .catch(() => setSettings({}))
            .finally(() => setIsLoading(false));
    }, []);

    const waNumber = settings?.whatsappNumber || "7639390868";
    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hello! I'd like to enquire about your invitation designs.")}`;

    const InfoCard = ({ icon: Icon, title, value }: { icon: any; title: string; value?: string }) => (
        <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lavender/10 text-lavender">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-serif">{title}</h3>
            {isLoading ? (
                <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
            ) : (
                <p className="text-charcoal/60 font-medium whitespace-pre-line">{value || "—"}</p>
            )}
        </div>
    );

    return (
        <main className="min-h-screen bg-white">
            <LuxuryNavbar />

            <div className="mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl font-bold text-charcoal sm:text-6xl font-serif">Get in Touch</h1>
                    <p className="mt-4 text-lg text-charcoal/60 max-w-2xl mx-auto">
                        Have questions about our designs or customization options?
                        We&apos;re here to help you create something extraordinary.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Details */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-12"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                            <InfoCard icon={Phone} title="Call Us" value={settings?.phone} />
                            <InfoCard icon={Mail} title="Email Us" value={settings?.email} />
                            <InfoCard icon={MapPin} title="Visit Studio" value={settings?.address} />
                            <InfoCard icon={Clock} title="Business Hours" value={settings?.businessHours} />
                        </div>

                        {/* Google Maps Placeholder */}
                        <div className="relative h-80 w-full overflow-hidden rounded-[2rem] bg-soft-grey shadow-inner">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.2198424269!2d72.825126!3d18.966964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce2d9489269d%3A0xc3687353f478a2e4!2sMarine%20Drive!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                                className="h-full w-full border-0 opacity-80"
                                loading="lazy"
                            />
                        </div>
                    </motion.div>

                    {/* WhatsApp CTA Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center justify-center rounded-[3rem] bg-soft-grey p-12 text-center"
                    >
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6 shadow-lg shadow-green-100">
                            <MessageCircle className="h-10 w-10" />
                        </div>
                        <h2 className="text-3xl font-bold font-serif mb-4">Chat with Us</h2>
                        <p className="text-charcoal/60 max-w-sm mb-8 leading-relaxed">
                            The fastest way to get a response is directly on WhatsApp. Share your requirements
                            and we&apos;ll get back to you instantly.
                        </p>
                        <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-full transition-all shadow-xl shadow-green-200 hover:shadow-green-300 hover:-translate-y-1 active:scale-95"
                        >
                            <MessageCircle className="h-6 w-6" />
                            Enquire on WhatsApp
                        </a>
                        <p className="mt-6 text-xs text-charcoal/30 font-medium uppercase tracking-widest">
                            Typically replies within 30 minutes
                        </p>
                    </motion.div>
                </div>
            </div>

            <LuxuryFooter />
        </main>
    );
}
