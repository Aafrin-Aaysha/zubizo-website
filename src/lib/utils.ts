import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function sanitizeWhatsAppNumber(number: string) {
    return number.replace(/[^0-9]/g, '');
}

export function getWhatsAppNumber() {
    const numbers = ["8124548133"];
    // Simple random selection for load balancing
    // Alternatively, we could use localStorage to persist for a user, 
    // but random is sufficient for distribution across many users.
    const randomIndex = Math.floor(Math.random() * numbers.length);
    return numbers[randomIndex];
}

export function getStartingPrice(design: any) {
    // 1. Fallback if no packages exist
    if (!design.packages || design.packages.length === 0) {
        return design.basePrice || 0;
    }

    // 2. Determine target quantity (default to 100 if both minQuantity and package tiers are missing)
    const minQty = design.minQuantity || 50;
    const basicPkg = design.packages[0];

    // 3. Find relevant price in basic package
    if (basicPkg.priceTiers && basicPkg.priceTiers.length > 0) {
        // Find the tier that matches minQty
        const matchingTier = basicPkg.priceTiers.find((t: any) =>
            minQty >= t.minQty && (t.maxQty == null || minQty <= t.maxQty)
        );

        if (matchingTier) {
            return matchingTier.pricePerCard;
        }

        // Fallback: If no tier matches minQty exactly, use the tier with the smallest minQty
        const startingTier = basicPkg.priceTiers.reduce((prev: any, curr: any) =>
            curr.minQty < prev.minQty ? curr : prev
            , basicPkg.priceTiers[0]);

        return startingTier.pricePerCard;
    }

    // 4. Final fallbacks
    return basicPkg.pricePerCard || design.basePrice || 0;
}
