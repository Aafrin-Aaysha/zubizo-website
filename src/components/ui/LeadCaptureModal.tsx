"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Phone, User, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LeadData {
    name: string;
    phone: string;
}

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: LeadData) => Promise<void>;
}

export function LeadCaptureModal({ isOpen, onClose, onSubmit }: LeadCaptureModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('+91');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const savedData = localStorage.getItem('zubizo_customer_info');
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    if (parsed.name) setName(parsed.name);
                    if (parsed.phone) setPhone(parsed.phone);
                } catch (e) {
                    console.error('Failed to parse saved customer info');
                }
            }
            setError('');
        }
    }, [isOpen]);

    const validateForm = () => {
        if (name.trim().length < 3) {
            setError('Please enter a valid name (min 3 characters).');
            return false;
        }

        const phoneRegex = /^\+\d{10,15}$/;
        if (!phoneRegex.test(phone.trim().replace(/\s+/g, ''))) {
            setError('Please enter a valid number with country code (e.g. +918123456789).');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsSubmitting(true);
        setError('');

        const data: LeadData = { 
            name: name.trim(), 
            phone: phone.trim().replace(/\s+/g, '') 
        };

        try {
            await onSubmit(data);
            localStorage.setItem('zubizo_customer_info', JSON.stringify(data));
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-lavender/10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-gray-400 hover:text-charcoal transition-colors z-10 bg-white/80 rounded-full p-1"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            <div className="text-center mb-8">
                                <div className="mx-auto w-16 h-16 bg-lavender/10 rounded-full flex items-center justify-center mb-4 border border-lavender/20">
                                    <Phone className="text-lavender w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-black font-serif text-charcoal">Almost there!</h2>
                                <p className="text-sm text-gray-500 mt-2 font-medium">
                                    Please share your details so we can assist you better on WhatsApp.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                            Your Name <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="e.g. John Doe"
                                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-lavender focus:ring-4 focus:ring-lavender/10 outline-none transition-all placeholder:font-medium placeholder:text-gray-300"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                            WhatsApp Number <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300">
                                                <Phone size={18} />
                                            </div>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+918123456789"
                                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-lavender focus:ring-4 focus:ring-lavender/10 outline-none transition-all placeholder:font-medium placeholder:text-gray-300 tracking-wider"
                                            />
                                        </div>
                                        <p className="text-[9px] text-gray-400 mt-1.5 ml-1 uppercase tracking-widest font-bold">Include country code (e.g. +91)</p>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
                                        <X size={14} className="shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-14 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group mt-8 z-10 relative"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <span>Continue to WhatsApp</span>
                                            <CheckCircle2 size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                                        </>
                                    )}
                                </button>
                                
                                <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-4">
                                    Your data is securely captured
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
