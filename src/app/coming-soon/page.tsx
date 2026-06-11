"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
    MapPin, 
    Phone, 
    Instagram, 
    FileText, 
    X,
    CheckCircle2,
    Palette,
    Clock,
    CreditCard,
    XCircle,
    AlertTriangle,
    Truck,
    ShieldAlert,
    Package,
    RefreshCcw,
    Info
} from "lucide-react";
import { LogoIcon } from "@/components/ui/logo-icon";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

const termsItems = [
    {
        id: "order-confirmation",
        icon: CheckCircle2,
        title: "Order Confirmation",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        badge: "bg-emerald-100 text-emerald-700",
        points: [
            "Orders are confirmed only after receiving the initial advance payment.",
            "No work will begin without payment confirmation.",
        ],
    },
    {
        id: "design-process",
        icon: Palette,
        title: "Design Process & Approval",
        color: "text-violet-600",
        bg: "bg-violet-50",
        border: "border-violet-100",
        badge: "bg-violet-100 text-violet-700",
        points: [
            "Upon order confirmation and receipt of the advance payment, the initial design draft will be provided within 48 hours.",
            "A digital design proof will be shared for your review.",
            "Clients must check all details carefully (names, dates, content, etc.).",
            "Once approved, the design is final.",
            "Any changes after approval will be charged additionally.",
        ],
        highlight:
            "Once you approve the design, no free changes will be made.",
    },
    {
        id: "production-timeline",
        icon: Clock,
        title: "Production Timeline",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        badge: "bg-amber-100 text-amber-700",
        points: [
            "Production starts after final design approval.",
            "Standard timeline: 7–10 working days.",
            "Sundays & public holidays are not included.",
            "Urgent orders may be accepted with extra charges (based on availability).",
        ],
    },
    {
        id: "payment-policy",
        icon: CreditCard,
        title: "Payment Policy",
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
        badge: "bg-blue-100 text-blue-700",
        points: [
            "50% advance is required to begin the order.",
            "Remaining balance must be paid before dispatch.",
            "Orders will not be released without full payment.",
        ],
        highlight: "Full payment is required before your order is dispatched.",
    },
    {
        id: "cancellation",
        icon: XCircle,
        title: "Cancellation & Refund",
        color: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-100",
        badge: "bg-rose-100 text-rose-700",
        points: [
            "Advance payment is non-refundable once design work has started.",
            "Orders cannot be cancelled after production begins.",
        ],
    },
    {
        id: "color-material",
        icon: AlertTriangle,
        title: "Color & Material Disclaimer",
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-100",
        badge: "bg-orange-100 text-orange-700",
        points: [
            "Slight variations in color, print, or material may occur due to screen settings and production process.",
            "These are not considered defects.",
        ],
    },
    {
        id: "delivery-policy",
        icon: Truck,
        title: "Delivery Policy",
        color: "text-teal-600",
        bg: "bg-teal-50",
        border: "border-teal-100",
        badge: "bg-teal-100 text-teal-700",
        points: [
            "Delivery timelines depend on courier services.",
            "We are not responsible for delays, damage, or loss during transit.",
            "Customers must provide accurate shipping details.",
        ],
    },
    {
        id: "responsibility",
        icon: ShieldAlert,
        title: "Responsibility",
        color: "text-slate-600",
        bg: "bg-slate-50",
        border: "border-slate-100",
        badge: "bg-slate-100 text-slate-700",
        points: [
            "We are not responsible for errors approved in the final design.",
            "Please ensure all details are correct before approval.",
        ],
    },
];

const shippingItems = [
    {
        icon: Clock,
        title: "Delivery Time",
        color: "text-teal-600",
        bg: "bg-teal-50",
        points: [
            "Orders within Tamil Nadu will be delivered in 2–3 working days.",
            "Orders to other states will be delivered in 3–7 working days, depending on the location.",
        ],
    },
    {
        icon: CreditCard,
        title: "Shipping Charges",
        color: "text-blue-600",
        bg: "bg-blue-50",
        points: [
            "Shipping charges are applicable and vary based on location and order size.",
            "Final charges will be informed before dispatch.",
        ],
    },
    {
        icon: Package,
        title: "Tracking",
        color: "text-violet-650",
        bg: "bg-violet-50",
        points: [
            "Tracking details will be shared once the order is dispatched so you can monitor your delivery.",
        ],
    },
    {
        icon: AlertTriangle,
        title: "Delays",
        color: "text-amber-600",
        bg: "bg-amber-50",
        points: [
            "Delivery timelines may be affected due to courier delays, weather conditions, or other unforeseen circumstances.",
            "We are not responsible for such delays.",
        ],
    },
    {
        icon: ShieldAlert,
        title: "Damage or Loss",
        color: "text-rose-600",
        bg: "bg-rose-50",
        points: [
            "We are not responsible for any damage or loss during transit handled by courier services.",
            "However, we will assist you in resolving the issue wherever possible.",
        ],
    },
    {
        icon: MapPin,
        title: "Address Accuracy",
        color: "text-orange-600",
        bg: "bg-orange-50",
        points: [
            "Customers must provide complete and accurate shipping details.",
            "We are not responsible for delivery issues caused due to incorrect address information.",
        ],
    },
];

const refundPoints = [
    "Advance payment is non-refundable once the design process has started.",
    "No refunds will be provided after final design approval.",
    "Orders cannot be refunded once production has begun.",
];

export default function ComingSoonPage() {
    const waNumber = "918124548133";
    const instagramUrl = "https://instagram.com/zubizo.art";
    const phoneNumber = "+91 81245 48133";
    const addressDetails = "SS Arcade, 3F, 3rd Floor, Convent Road, Cantonment, Trichy 620001.";
    const [isPoliciesOpen, setIsPoliciesOpen] = React.useState(false);

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
        }
    };

    return (
        <main className="min-h-screen lg:h-screen lg:max-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 md:p-8 relative overflow-x-hidden overflow-y-auto lg:overflow-hidden font-dmsans">
            {/* Background luxury gradient circles */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#EDE8F6]/40 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#EDE8F6]/30 blur-[100px] pointer-events-none" />

            <motion.div
                className="max-w-5xl w-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 relative z-10 py-6 lg:py-0"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Left Column: Brand Info & Call to Actions */}
                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8 max-w-xl">
                    {/* Logo and Branding Header */}
                    <motion.div className="flex flex-col lg:flex-row items-center gap-3" variants={itemVariants}>
                        <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border border-[#ae7fcb]/20 shrink-0">
                            <LogoIcon size={28} className="text-[#ae7fcb]" />
                        </div>
                        <span 
                            className="text-3xl md:text-4xl font-semibold italic text-[#ae7fcb] tracking-wide mt-1 lg:mt-0"
                            style={{ fontFamily: 'var(--font-fraunces), serif' }}
                        >
                            Zubizo
                        </span>
                    </motion.div>

                    {/* Main Heading & Tagline */}
                    <motion.div className="space-y-3" variants={itemVariants}>
                        <p 
                            className="text-3xl md:text-4xl font-normal text-slate-800 tracking-tight leading-tight"
                            style={{ fontFamily: 'var(--font-italiana), serif' }}
                        >
                            Crafting Something Beautiful
                        </p>
                        <div className="w-16 h-0.5 bg-[#ae7fcb]/30 rounded-full mx-auto lg:mx-0" />
                        <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-md">
                            Our premium digital experience is currently under construction. Meanwhile, we remain fully open for custom invitation designs and bespoke stationery commissions.
                        </p>
                    </motion.div>

                    {/* Primary WhatsApp / Instagram Contact CTAs */}
                    <motion.div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full" variants={itemVariants}>
                        <a
                            href={`https://wa.me/${waNumber}?text=Hello%20Zubizo%2C%20I'm%20interested%20in%20enquiring%20about%20your%20custom%20invitations.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-full transition-all shadow-lg shadow-green-100 hover:shadow-green-200 active:scale-98"
                        >
                            <WhatsAppIcon size={18} className="text-white" />
                            <span>Chat on WhatsApp</span>
                        </a>
                        
                        <a
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-full border border-slate-200 transition-all shadow-md active:scale-98"
                        >
                            <Instagram size={18} className="text-pink-600" />
                            <span>Visit Instagram</span>
                        </a>

                        <button
                            onClick={() => setIsPoliciesOpen(true)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-full border border-slate-200 transition-all shadow-md active:scale-98 cursor-pointer"
                        >
                            <FileText size={18} className="text-[#6E4B8B]" />
                            <span>Our Policies</span>
                        </button>
                    </motion.div>
                </div>

                {/* Right Column: Studio Contact Details Card */}
                <div className="w-full max-w-md lg:max-w-lg">
                    <motion.div 
                        className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 md:p-8 border border-[#ae7fcb]/10 shadow-luxury space-y-5 text-left"
                        variants={itemVariants}
                    >
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 font-dmsans">
                            Zubizo Studio Contacts
                        </p>

                        <div className="space-y-4">
                            {/* Address */}
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-2 rounded-lg bg-[#EDE8F6]/60 text-[#6E4B8B] shrink-0">
                                    <MapPin size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-dmsans">Studio Address</p>
                                    <p className="text-slate-650 text-xs md:text-sm leading-relaxed mt-0.5 font-light">
                                        {addressDetails}
                                    </p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-2 rounded-lg bg-[#EDE8F6]/60 text-[#6E4B8B] shrink-0">
                                    <Phone size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-dmsans">Call or WhatsApp</p>
                                    <p className="text-slate-650 text-xs md:text-sm leading-relaxed mt-0.5 font-light">
                                        <a href={`tel:${phoneNumber.replace(/\s+/g, '')}`} className="hover:text-[#6E4B8B] transition-colors">
                                            {phoneNumber}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Policies Modal Overlay */}
            <AnimatePresence>
                {isPoliciesOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6"
                        onClick={() => setIsPoliciesOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-[#FAF8F5] max-w-3xl w-full max-h-[85vh] rounded-[2.5rem] border border-[#ae7fcb]/15 shadow-2xl overflow-y-auto relative p-6 md:p-10 text-slate-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsPoliciesOpen(false)}
                                className="absolute right-6 top-6 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors shadow-sm cursor-pointer z-20"
                            >
                                <X size={18} />
                            </button>

                            {/* Header */}
                            <div className="text-center mb-10">
                                <span className="text-[#6E4B8B] tracking-[0.15em] font-bold uppercase text-[10px] mb-2 block">
                                    LEGAL &amp; TRUST
                                </span>
                                <h2 className="text-3xl md:text-4xl font-italiana font-normal text-slate-800 mb-4">
                                    Our Policies
                                </h2>
                                <p className="text-slate-505 text-xs md:text-sm max-w-lg mx-auto leading-relaxed font-light">
                                    Transparency and trust at the heart of Zubizo. Please review our terms, shipping, and refund policies.
                                </p>
                            </div>

                            {/* Scrollable Content */}
                            <div className="space-y-12">
                                {/* Terms & Conditions */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 border-b border-[#ae7fcb]/10 pb-3">
                                        <FileText size={20} className="text-[#6E4B8B]" />
                                        <h3 className="text-lg font-italiana text-slate-800">Terms &amp; Conditions</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {termsItems.map((item, i) => {
                                            const Icon = item.icon;
                                            return (
                                                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-4">
                                                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center ${item.color} shrink-0`}>
                                                        <Icon size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">{item.title}</h4>
                                                        <ul className="space-y-2">
                                                            {item.points.map((point, j) => (
                                                                <li key={j} className="flex items-start gap-2.5 text-xs text-slate-650 leading-relaxed font-light">
                                                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#ae7fcb] shrink-0" />
                                                                    {point}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {item.highlight && (
                                                            <div className={`mt-3 flex items-start gap-2 ${item.bg} rounded-xl px-3 py-2.5`}>
                                                                <Info size={12} className={`${item.color} shrink-0 mt-0.5`} />
                                                                <p className={`text-[10px] font-semibold ${item.color}`}>
                                                                    {item.highlight}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Shipping Policy */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 border-b border-[#ae7fcb]/10 pb-3">
                                        <Truck size={20} className="text-[#6E4B8B]" />
                                        <h3 className="text-lg font-italiana text-slate-800">Shipping Policy</h3>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {shippingItems.map((item, i) => {
                                            const Icon = item.icon;
                                            return (
                                                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center ${item.color} mb-3`}>
                                                        <Icon size={16} />
                                                    </div>
                                                    <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">{item.title}</h4>
                                                    <ul className="space-y-2">
                                                        {item.points.map((point, j) => (
                                                            <li key={j} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed font-light">
                                                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#ae7fcb] shrink-0" />
                                                                {point}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Refund Policy */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 border-b border-[#ae7fcb]/10 pb-3">
                                        <RefreshCcw size={20} className="text-[#6E4B8B]" />
                                        <h3 className="text-lg font-italiana text-slate-800">Refund Policy</h3>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                                        <ul className="space-y-3">
                                            {refundPoints.map((point, i) => (
                                                <li key={i} className="flex items-start gap-3 text-xs text-slate-655 leading-relaxed font-light">
                                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#ae7fcb] shrink-0" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="bg-[#EDE8F6]/50 border border-[#ae7fcb]/15 rounded-xl p-4 flex items-start gap-3">
                                            <AlertTriangle size={16} className="text-[#6E4B8B] shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-slate-600 leading-relaxed font-light">
                                                <strong className="text-slate-800 font-semibold">Important:</strong> Once a design is approved and production has begun, no cancellations or refunds are possible.
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
