import React from "react";
import { cn } from "@/lib/utils";

export const SectionDivider = ({ className }: { className?: string }) => {
    return (
        <div className={cn("flex justify-center items-center py-12 w-full", className)}>
            <div className="w-32 h-[1px] bg-gradient-to-r from-transparent to-[#d8c9a6]/50" />
            <div className="mx-6 w-2 h-2 rotate-45 border border-[#d8c9a6] opacity-70" />
            <div className="w-32 h-[1px] bg-gradient-to-l from-transparent to-[#d8c9a6]/50" />
        </div>
    );
};
