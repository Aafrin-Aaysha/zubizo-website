"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { InvitationDesign } from "@/lib/mock-data";

interface CartItem extends InvitationDesign {
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (design: InvitationDesign, quantity: number) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("zubizo_cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem("zubizo_cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (design: InvitationDesign, quantity: number) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === design.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === design.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prev, { ...design, quantity }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        setCart((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => setCart([]);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
