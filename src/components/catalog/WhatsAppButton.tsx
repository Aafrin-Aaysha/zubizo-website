"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface WhatsAppButtonProps {
    designId: string;
    designName: string;
    sku: string;
    categoryName: string;
    whatsappNumber: string;
    source: string;
    selectedPackage?: string;
    quantity?: number;
    estimatedTotal?: number;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
    designId,
    designName,
    sku,
    categoryName,
    whatsappNumber,
    source,
    selectedPackage,
    quantity,
    estimatedTotal
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);

        // Payload optimized for the new Inquiry model
        const payload = {
            designId,
            designName,
            sku,
            selectedPackage: selectedPackage || 'Standard',
            quantity: quantity || 50,
            estimatedTotal: estimatedTotal || 0,
            source
        };

        try {
            // Log inquiry before redirecting
            await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error("Failed to log inquiry:", error);
        }

        const message = `Hi Zubizo,

I am interested in:

*Design:* ${designName}
*SKU:* ${sku}
${selectedPackage ? `*Package:* ${selectedPackage}` : ''}
${quantity ? `*Quantity:* ${quantity} cards` : ''}
${estimatedTotal ? `*Estimated Total:* ₹${estimatedTotal.toLocaleString('en-IN')}` : ''}

Please share details.`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');

        setIsLoading(false);
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 h-10 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-70 group tracking-wide"
        >
            {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <MessageCircle size={16} />
            )}
            {isLoading ? 'Wait...' : 'Enquire'}
        </button>
    );
};
