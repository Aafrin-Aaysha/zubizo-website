"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-lavender text-white shadow-premium hover:shadow-luxury hover:-translate-y-0.5",
            secondary: "bg-soft-lilac text-lavender hover:bg-lavender hover:text-white hover:-translate-y-0.5 hover:shadow-luxury",
            outline: "border border-lavender/30 text-lavender hover:bg-lavender/5 hover:border-lavender hover:-translate-y-0.5",
            ghost: "text-lavender hover:bg-soft-lilac/40",
        };

        const sizes = {
            sm: "px-4 py-2 text-xs uppercase tracking-wider font-bold",
            md: "px-7 py-3 text-sm font-medium tracking-wide",
            lg: "px-10 py-4 text-base font-semibold tracking-wide",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "inline-flex items-center justify-center rounded-full transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { Button };
