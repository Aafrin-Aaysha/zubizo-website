import { cn } from "@/lib/utils";

export const LogoIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <img
        src="/logo.png"
        alt="Zubizo Logo"
        width={size}
        height={size}
        className={cn("object-contain", className)}
        style={{ width: size, height: size }}
    />
);
