"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Trash2, Plus, Minus, MessageCircle } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "./ui/button";
import Image from "next/image";

const CartSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

    const subtotal = cart.reduce((sum, item) => {
        const discount = item.quantity >= 500 ? 0.8 : item.quantity >= 200 ? 0.9 : 1;
        return sum + (item.price * item.quantity * discount);
    }, 0);

    const handleWhatsAppCheckout = () => {
        const itemsList = cart.map(item => `${item.name} – Qty: ${item.quantity}`).join("\n");
        const message = `Hi Zubizo, I would like to order the following designs:\n\n${itemsList}\n\nPlease share the final pricing and timeline.`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/911234567890?text=${encodedMessage}`, "_blank");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-charcoal/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 z-[70] h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
                    >
                        <div className="flex items-center justify-between border-b border-soft-grey p-6">
                            <div className="flex items-center space-x-3">
                                <ShoppingBag className="h-6 w-6 text-lavender" />
                                <h2 className="text-xl font-bold font-serif">Selected Designs</h2>
                                <span className="rounded-full bg-soft-grey px-2.5 py-0.5 text-xs font-bold text-charcoal">
                                    {cart.length}
                                </span>
                            </div>
                            <button onClick={onClose} className="p-2 transition-colors hover:text-lavender">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length > 0 ? (
                                cart.map((item) => (
                                    <div key={item.id} className="flex space-x-4">
                                        <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-soft-grey">
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between">
                                                <h3 className="font-bold text-charcoal leading-tight">{item.name}</h3>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-charcoal/20 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-lavender font-semibold uppercase">{item.category}</p>

                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center rounded-lg bg-soft-grey p-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, Math.max(50, item.quantity - 50))}
                                                        className="p-1 hover:text-lavender"><Minus className="h-3 w-3" /></button>
                                                    <span className="px-3 text-xs font-bold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 50)}
                                                        className="p-1 hover:text-lavender"><Plus className="h-3 w-3" /></button>
                                                </div>
                                                <p className="text-sm font-bold text-charcoal">₹{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                    <div className="rounded-full bg-soft-grey p-6">
                                        <ShoppingBag className="h-12 w-12 text-charcoal/20" />
                                    </div>
                                    <p className="text-charcoal/40 font-serif italic text-lg">No designs selected yet.</p>
                                    <Button variant="outline" onClick={onClose}>Browse Collections</Button>
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="border-t border-soft-grey p-6 space-y-4 bg-soft-grey/30">
                                <div className="flex items-center justify-between text-lg font-bold">
                                    <span className="font-serif">Subtotal</span>
                                    <span className="text-2xl font-serif">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-charcoal/40 font-medium text-center italic">
                                    *Final pricing subject to printing styles and paper choice.
                                </p>
                                <Button
                                    className="w-full py-6 text-lg"
                                    onClick={handleWhatsAppCheckout}
                                >
                                    <MessageCircle className="mr-2 h-6 w-6" />
                                    Confirm on WhatsApp
                                </Button>
                                <button
                                    onClick={clearCart}
                                    className="w-full text-xs font-bold text-charcoal/40 uppercase tracking-widest hover:text-red-500 transition-colors"
                                >
                                    Clear All Selections
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export { CartSidebar };
