import * as React from "react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { getWhatsAppNumber } from "@/lib/utils";

export const WhatsAppFixed = () => {
    const whatsappNumber = getWhatsAppNumber();
    return (
        <a
            href={`https://wa.me/${whatsappNumber}?text=Hi%20Zubizo,%20I%20would%20like%20to%20enquire%20about%20your%20invitation%20designs.`}
            target="_blank"
            rel="noopener noreferrer"
            className="lg:hidden fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group"
            aria-label="Chat on WhatsApp"
        >
            <WhatsAppIcon size={32} />
            <span className="absolute right-full mr-4 bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                Chat with us
            </span>
        </a>
    );
};
