"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getWhatsAppNumber } from '@/lib/utils';
import { LeadCaptureModal, LeadData } from '../ui/LeadCaptureModal';

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
    imageUrl?: string;
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
    estimatedTotal,
    imageUrl
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (data: LeadData) => {
        setIsLoading(true);

        const payload = {
            designId,
            designName,
            sku,
            selectedPackage: selectedPackage || 'Standard',
            quantity: quantity || 50,
            estimatedTotal: estimatedTotal || 0,
            source,
            customerName: data.name,
            phone: data.phone
        };

        try {
            await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error("Failed to log inquiry:", error);
        }

        const message = `*Inquiry from Website*

Hello Zubizo,

My name is ${data.name}.
My contact number is ${data.phone}.

I am interested in:
*Design:* ${designName}
*SKU:* ${sku}${imageUrl ? `\n*View Design:* ${imageUrl}` : ''}
${selectedPackage ? `*Package:* ${selectedPackage}` : ''}
${quantity ? `*Quantity:* ${quantity} cards` : ''}

Please share details.`;

        const encodedMessage = encodeURIComponent(message);
        const cleanNumber = getWhatsAppNumber();
        window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, '_blank');

        setIsLoading(false);
        setIsModalOpen(false);
    };

    return (
        <>
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

            <LeadCaptureModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
            />
        </>
    );
};
