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

const StarBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w: number, h: number;
        let particles: any[] = [];
        const particleCount = 350;
        const dpr = window.devicePixelRatio || 1;

        const init = () => {
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);

            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: (Math.random() - 0.5) * w * 3,
                    y: (Math.random() - 0.5) * h * 3,
                    z: Math.random() * w,
                    size: Math.random() * 1.5 + 0.5,
                    speed: Math.random() * 0.3 + 0.1,
                    color: Math.random() > 0.85 ? palette.goldMain : palette.white,
                    opacity: Math.random() * 0.6 + 0.4,
                    phase: Math.random() * Math.PI * 2,
                    isGatsby: Math.random() > 0.985,
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
                    p.x = (Math.random() - 0.5) * w * 3;
                    p.y = (Math.random() - 0.5) * h * 3;
                }

                const projectionK = 180.0 / p.z;
                const px = p.x * projectionK + centerX;
                const py = p.y * projectionK + centerY;

                if (px < -100 || px > w + 100 || py < -100 || py > h + 100) return;

                // CINEMATIC TWINKLE LOGIC
                p.phase += 0.015;
                const twinkle = (Math.sin(p.phase) + 1) / 2;

                // Widened twinkle range (0.15 to 1.0) ensures persistent flickering
                const currentTwinkle = 0.15 + 0.85 * twinkle;

                const depthAlpha = 1 - (p.z / w);
                // Ensure even the closest stars flicker strongly
                const finalOpacity = p.opacity * currentTwinkle * (0.4 + 0.6 * depthAlpha);

                ctx.beginPath();
                if (p.isGatsby) {
                    ctx.fillStyle = palette.accentSuccess;
                    // Shadow pulsates with the star
                    ctx.shadowBlur = 15 * currentTwinkle;
                    ctx.shadowColor = palette.accentSuccess;
                } else {
                    ctx.fillStyle = p.color;
                    ctx.shadowBlur = p.color === palette.goldMain ? 5 * currentTwinkle : 0;
                    ctx.shadowColor = palette.goldMain;
                }

                ctx.globalAlpha = Math.max(0, Math.min(1, finalOpacity));

                const renderedSize = Math.max(0.6, p.size * projectionK * 0.5);
                ctx.arc(px, py, renderedSize, 0, Math.PI * 2);
                ctx.fill();

                // Long Tesseract Lines
                const lineRange = 450;
                if (p.z < lineRange) {
                    ctx.beginPath();
                    ctx.strokeStyle = palette.goldMain;
                    // Lines also breathe with the stars
                    ctx.globalAlpha = (1 - p.z / lineRange) * 0.12 * currentTwinkle;
                    ctx.lineWidth = 0.4;
                    ctx.moveTo(px, py);
                    ctx.lineTo(centerX, centerY);
                    ctx.stroke();
                }

                // Reset shadow for next particles
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

    return <Canvas ref={canvasRef} />;
};

export default StarBackground;
