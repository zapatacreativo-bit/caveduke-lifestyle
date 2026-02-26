import React, { useRef, useEffect, useCallback } from 'react';

// ----------------------------------------------------
// Premium constellation/network particle background
// Gold-themed connected dots with lines
// Pure Canvas 2D — lightweight, smooth, elegant
// ----------------------------------------------------

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
}

export default function GoldenParticles({ className = "" }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: -9999, y: -9999 });

    const initParticles = useCallback((width: number, height: number) => {
        // Fewer particles on mobile for performance
        const isMobile = width < 768;
        const count = isMobile ? 40 : 80;
        const particles: Particle[] = [];

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.3,
            });
        }

        particlesRef.current = particles;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.scale(dpr, dpr);
            initParticles(canvas.offsetWidth, canvas.offsetHeight);
        };

        resize();
        window.addEventListener('resize', resize);

        // Track mouse for interactive connections
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        const handleMouseLeave = () => {
            mouseRef.current = { x: -9999, y: -9999 };
        };
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        // Gold palette
        const goldRGB = '201, 169, 110'; // #C9A96E
        const connectionDistance = 150;

        const animate = () => {
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;
            ctx.clearRect(0, 0, w, h);

            const particles = particlesRef.current;

            // Update positions
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;
            }

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        const opacity = (1 - dist / connectionDistance) * 0.15;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${goldRGB}, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }

                // Mouse interaction lines
                const mx = mouseRef.current.x;
                const my = mouseRef.current.y;
                const mdx = particles[i].x - mx;
                const mdy = particles[i].y - my;
                const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

                if (mDist < connectionDistance * 1.5) {
                    const opacity = (1 - mDist / (connectionDistance * 1.5)) * 0.3;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${goldRGB}, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mx, my);
                    ctx.stroke();
                }
            }

            // Draw particles (dots)
            for (const p of particles) {
                // Outer glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${goldRGB}, ${p.alpha * 0.1})`;
                ctx.fill();

                // Core dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${goldRGB}, ${p.alpha})`;
                ctx.fill();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [initParticles]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 z-0 w-full h-full ${className}`}
            style={{ pointerEvents: 'auto' }}
        />
    );
}
