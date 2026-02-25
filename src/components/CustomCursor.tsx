import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
    const [isHovering, setIsHovering] = useState(false);
    const [hoverText, setHoverText] = useState('');

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Spring configuration for smooth follow
    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        // Only run on desktop
        if (window.matchMedia('(max-width: 1024px)').matches) return;

        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Interactive elements get a simple dot highlight
            if (target.closest('a') || target.closest('button') || target.closest('input')) {
                setIsHovering(true);
                setHoverText('');
            }
            // Specific elements get the "Explorar" large circle
            else if (target.closest('.collection-card')) {
                setIsHovering(true);
                setHoverText('Explorar');
            }
            // Images get the "Ver" large circle
            else if (target.closest('.heritage-img')) {
                setIsHovering(true);
                setHoverText('Arrastrar');
            }
            else {
                setIsHovering(false);
                setHoverText('');
            }
        };

        window.addEventListener('mousemove', moveCursor);
        document.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            document.removeEventListener('mouseover', handleMouseOver);
        };
    }, [cursorX, cursorY]);

    // Don't render on mobile/touch devices
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches) {
        return null;
    }

    const variants = {
        default: {
            width: 12,
            height: 12,
            backgroundColor: 'rgba(201, 169, 110, 1)', // var(--color-gold)
            mixBlendMode: 'normal' as const,
            x: '-50%',
            y: '-50%',
        },
        hover: {
            width: 48,
            height: 48,
            backgroundColor: 'rgba(201, 169, 110, 0.2)',
            border: '1px solid rgba(201, 169, 110, 0.8)',
            mixBlendMode: 'difference' as const,
            x: '-50%',
            y: '-50%',
        },
        text: {
            width: 100,
            height: 100,
            backgroundColor: 'rgba(10, 10, 10, 0.8)', // var(--color-noir)
            border: '1px solid rgba(201, 169, 110, 0.8)',
            mixBlendMode: 'normal' as const,
            x: '-50%',
            y: '-50%',
        }
    };

    const currentVariant = hoverText ? 'text' : (isHovering ? 'hover' : 'default');

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 rounded-full z-[9999] pointer-events-none flex items-center justify-center overflow-hidden"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                }}
                variants={variants}
                initial="default"
                animate={currentVariant}
                transition={{ type: 'spring', ...springConfig }}
            >
                {hoverText && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[var(--color-gold)] font-accent uppercase text-[10px] tracking-widest text-center"
                    >
                        {hoverText}
                    </motion.span>
                )}
            </motion.div>
        </>
    );
}
