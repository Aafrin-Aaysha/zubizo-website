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
