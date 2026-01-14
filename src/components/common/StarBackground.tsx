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
                // Adaptive size: Larger on desktop, calibrated for mobile
                const baseSize = isDesktop ? (Math.random() * 2.5 + 0.8) : (Math.random() * 1.5 + 0.6);

                particles.push({
                    x: (Math.random() - 0.5) * w * 4,
                    y: (Math.random() - 0.5) * h * 4,
                    z: Math.random() * w,
                    size: baseSize,
                    speed: isDesktop ? (Math.random() * 0.4 + 0.15) : (Math.random() * 0.3 + 0.1),
                    color: Math.random() > 0.8 ? palette.goldMain : palette.white,
                    opacity: Math.random() * 0.7 + 0.3,
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
                if (p.z <= 0) {
                    p.z = w;
                    p.x = (Math.random() - 0.5) * w * 4;
                    p.y = (Math.random() - 0.5) * h * 4;
                }

                // Projection Factor: Slightly larger constant for desktop to pop more
                const projectionK = (isDesktop ? 220.0 : 160.0) / p.z;
                const px = p.x * projectionK + centerX;
                const py = p.y * projectionK + centerY;

                if (px < -150 || px > w + 150 || py < -150 || py > h + 150) return;

                p.phase += 0.015;
                const twinkle = (Math.sin(p.phase) + 1) / 2;
                const currentTwinkle = 0.2 + 0.8 * twinkle;

                const depthAlpha = 1 - (p.z / w);
                const finalOpacity = p.opacity * currentTwinkle * (0.3 + 0.7 * depthAlpha);

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

                // Adaptive Render Size
                const renderedSize = Math.max(isDesktop ? 1.0 : 0.8, p.size * projectionK * 0.4);
                ctx.arc(px, py, renderedSize, 0, Math.PI * 2);
                ctx.fill();

                // Long Tether Lines
                const lineRange = isDesktop ? 550 : 400;
                if (p.z < lineRange) {
                    ctx.beginPath();
                    ctx.strokeStyle = palette.goldMain;
                    ctx.globalAlpha = (1 - p.z / lineRange) * (isDesktop ? 0.12 : 0.08) * currentTwinkle;
                    ctx.lineWidth = isDesktop ? 0.6 : 0.4;
                    ctx.moveTo(px, py);
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
