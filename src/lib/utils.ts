import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function sanitizeWhatsAppNumber(number: string) {
    return number.replace(/[^0-9]/g, '');
}

export function getWhatsAppNumber() {
    const numbers = ["8124548133", "9092981748"];
    // Simple random selection for load balancing
    // Alternatively, we could use localStorage to persist for a user, 
    // but random is sufficient for distribution across many users.
    const randomIndex = Math.floor(Math.random() * numbers.length);
    return numbers[randomIndex];
}

export function getStartingPrice(design: any) {
    if (!design.packages || design.packages.length === 0) {
        return design.basePrice || 0;
    }

    let minPrice = Infinity;

    design.packages.forEach((pkg: any) => {
        if (pkg.priceTiers && pkg.priceTiers.length > 0) {
            pkg.priceTiers.forEach((tier: any) => {
                if (tier.pricePerCard < minPrice) {
                    minPrice = tier.pricePerCard;
                }
            });
        } else if (pkg.pricePerCard > 0 && pkg.pricePerCard < minPrice) {
            // Fallback to legacy field if tiers are missing but legacy price exists
            minPrice = pkg.pricePerCard;
        }
    });

    return minPrice === Infinity ? (design.basePrice || 0) : minPrice;
}
