import React from "react";
import { cn } from "@/lib/utils";

export const SectionDivider = ({ className }: { className?: string }) => {
    return (
        <div className={cn("w-full h-[1px] bg-[#ECE7E1]", className)} />
    );
};
