"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const springConfig = { damping: 20, stiffness: 150, mass: 0.4 };
    const cursorX = useSpring(0, springConfig);
    const cursorY = useSpring(0, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            cursorX.set(e.clientX - 16); // Center the 32px cursor
            cursorY.set(e.clientY - 16);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName.toLowerCase() === 'button' ||
                target.tagName.toLowerCase() === 'a' ||
                target.closest('button') ||
                target.closest('a')
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, [cursorX, cursorY]);

    return (
        <>
            {/* The main tiny dot that follows exactly */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-lavender rounded-full pointer-events-none z-[9999] mix-blend-multiply hidden md:block"
                animate={{
                    x: mousePosition.x - 4,
                    y: mousePosition.y - 4,
                    scale: isHovering ? 0 : 1,
                    opacity: isHovering ? 0 : 1
                }}
                transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
            />
            {/* The soft glowing ring that follows with a spring and expands on hover */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9998] hidden md:flex items-center justify-center"
                style={{
                    x: cursorX,
                    y: cursorY,
                    backgroundColor: isHovering ? 'rgba(174, 127, 203, 0.15)' : 'transparent',
                    border: isHovering ? 'none' : '1px solid rgba(174, 127, 203, 0.4)',
                }}
                animate={{
                    scale: isHovering ? 1.8 : 1,
                }}
                transition={{ type: "tween", ease: "backOut", duration: 0.2 }}
            />
        </>
    );
};
