import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { palette } from '@/assets/styles/palette';

const Canvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1; 
  pointer-events: none;
`;

/**
 * StarBackground - Responsive Cinematic Edition
 * Optimized visibility for both Mobile and Large Desktop screens.
 */
const StarBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w: number, h: number;
        let particles: any[] = [];
        const dpr = window.devicePixelRatio || 1;

        // Detect if we are on a large screen
        const isDesktop = window.innerWidth > 1024;
        const particleCount = isDesktop ? 400 : 200; // More stars on large screens

        const init = () => {
            w = window.innerWidth;
            h = window.innerHeight;

            // Standard High-DPI Scaling
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);

            particles = [];
            for (let i = 0; i < particleCount; i++) {
                // VISIBILITY FIX:
                const baseSize = isDesktop
                    ? (Math.random() * 2.5 + 0.8)
                    : (Math.random() * 2.0 + 1.2);

                // AVOID CENTER SPAWN: Keep center clear to avoid "face-smacking" artifacts
                // Generate a random angle and a radius ensuring it's not too close to 0
                const angle = Math.random() * Math.PI * 2;
                // Minimum radius of 10% of screen width to ensure text readability or center avoidance
                const radius = (Math.random() * 1.5 + 0.1) * (w > h ? w : h);

                particles.push({
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                    z: Math.random() * w,
                    size: baseSize,
                    speed: isDesktop ? (Math.random() * 0.4 + 0.15) : (Math.random() * 0.2 + 0.05),
                    color: Math.random() > 0.8 ? palette.goldMain : palette.white,
                    opacity: isDesktop ? (Math.random() * 0.7 + 0.3) : (Math.random() * 0.5 + 0.5),
                    phase: Math.random() * Math.PI * 2,
                    isGatsby: Math.random() > 0.98,
                });
            }
        };

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, w, h);

            const centerX = w / 2;
            const centerY = h / 2;

            particles.forEach((p) => {
                p.z -= p.speed;

                // Reset if it passes viewer
                if (p.z <= 0) {
                    p.z = w;
                    // Respawn logic
                    const angle = Math.random() * Math.PI * 2;
                    const radius = (Math.random() * 1.5 + 0.1) * (w > h ? w : h);
                    p.x = Math.cos(angle) * radius;
                    p.y = Math.sin(angle) * radius;
                }

                // PROJECTION
                const projectionK = (isDesktop ? 220.0 : 160.0) / p.z;
                const px = p.x * projectionK + centerX;
                const py = p.y * projectionK + centerY;

                // OUTWARD WARP: Slightly push x/y away from center as they get closer (z decreases)
                // This creates the "stars spreading to edges" effect
                // No need to modify p.x/p.y permanently, just the projection or add a factor visually?
                // Actually, standard perspective does this, but we can exaggerate it slightly if needed.
                // With the "center avoidance" spawn logic, standard perspective should look cleaner.

                // Bounds check
                if (px < -200 || px > w + 200 || py < -200 || py > h + 200) return;

                p.phase += 0.015;
                const twinkle = (Math.sin(p.phase) + 1) / 2;
                const currentTwinkle = 0.2 + 0.8 * twinkle;

                // FADE LOGIC:
                // 1. Fade in from back (depthAlpha)
                // 2. Fade OUT as it gets too close (proximityAlpha) to avoid giant blocky artifacts
                const depthAlpha = 1 - (p.z / w);
                const proximityCutoff = 80; // Distance where fadeout begins
                let proximityAlpha = 1;
                if (p.z < proximityCutoff) {
                    proximityAlpha = p.z / proximityCutoff;
                }

                const finalOpacity = p.opacity * currentTwinkle * (0.3 + 0.7 * depthAlpha) * proximityAlpha;

                if (finalOpacity <= 0.01) return;

                ctx.beginPath();
                if (p.isGatsby) {
                    ctx.fillStyle = palette.accentSuccess;
                    ctx.shadowBlur = isDesktop ? 18 * currentTwinkle : 10 * currentTwinkle;
                    ctx.shadowColor = palette.accentSuccess;
                } else {
                    ctx.fillStyle = p.color;
                    ctx.shadowBlur = (p.color === palette.goldMain && isDesktop) ? 8 * currentTwinkle : 0;
                    ctx.shadowColor = palette.goldMain;
                }

                ctx.globalAlpha = Math.max(0, Math.min(1, finalOpacity));

                // Size limiter: cap max size to avoid ugly pixelation
                const calculatedSize = p.size * projectionK * 0.4;
                const renderedSize = Math.min(calculatedSize, isDesktop ? 6 : 4);

                ctx.arc(px, py, renderedSize, 0, Math.PI * 2);
                ctx.fill();

                // Long Tether Lines (Trails) - Enhanced for Mobile
                const lineRange = isDesktop ? 550 : 400; // Visible range for lines
                if (p.z < lineRange && proximityAlpha > 0.1) {
                    ctx.beginPath();
                    ctx.strokeStyle = palette.goldMain;
                    // Mobile Trail Boost: Increased opacity multiplier on mobile
                    const trailOpacity = (1 - p.z / lineRange) * (isDesktop ? 0.12 : 0.15) * currentTwinkle * proximityAlpha;
                    ctx.globalAlpha = trailOpacity;
                    ctx.lineWidth = isDesktop ? 0.6 : 0.5;
                    ctx.moveTo(px, py);

                    // Trail origin: Instead of center, trace back towards vanishing point but stop short?
                    // Or just line to center (standard star wars warp).
                    // Center is fine, but let's make sure it doesn't look messy.
                    ctx.lineTo(centerX, centerY);
                    ctx.stroke();
                }

                ctx.shadowBlur = 0;
            });

            requestAnimationFrame(draw);
        };

        const handleResize = () => init();
        window.addEventListener('resize', handleResize);
        init();
        const animationId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return <Canvas ref={canvasRef} id="cinematic-starfield" />;
};

export default StarBackground;
