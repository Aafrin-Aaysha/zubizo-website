import * as React from "react";
import { cn } from "@/lib/utils";

export const LogoIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* Envelope Base */}
        <path
            d="M4 6H20C21.1 6 22 6.9 22 8V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V8C2 6.9 2.9 6 4 6Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
        />
        <path
            d="M22 8L12 13L2 8"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
        />

        {/* Feather Pen Icon Overlaid */}
        <path
            d="M18.5 3C17.5 3 14 4.5 13 8.5C12.5 10.5 13 12.5 14 13.5L12 21L14.5 19L16.5 21L15.5 14C16.5 13.5 18 12 19 10C20 8 20.5 4 18.5 3Z"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="currentColor"
            fillOpacity="0.1"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
