import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { palette } from '@/assets/styles/palette';

// Image Import
import nebulaBg from '@/assets/images/nebula-bg.png';

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1; 
  pointer-events: none;
  background-color: transparent; // Changed from bgPrimary to allow layering test
`;

const BackgroundLayer = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${nebulaBg});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: ${props => props.$visible ? 0.4 : 0};
  transition: opacity 1.5s ease-in-out;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

/**
 * StarBackground - Responsive Cinematic Edition
 * Optimized visibility for both Mobile and Large Desktop screens.
 */
interface StarBackgroundProps {
    showNebula?: boolean;
}

const StarBackground: React.FC<StarBackgroundProps> = ({ showNebula = true }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        // ... (rest of logic)
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w: number, h: number;
        let particles: any[] = [];
        const dpr = window.devicePixelRatio || 1;

        // Detect if we are on a large screen
        const isDesktop = window.innerWidth > 1024;

        // PERFORMANCE TUNING: Calibrated for iPhone SE2 (approx 60% load)
        // 120 particles is rich enough without overheating A13 chips
        const particleCount = isDesktop ? 400 : 120;

        const init = () => {
            w = window.innerWidth;
            h = window.innerHeight;

            // PERFORMANCE FIX: Cap mobile resolution. High DPI (3x) on mobile kills performance.
            const safeDpr = isDesktop ? (window.devicePixelRatio || 1) : Math.min(window.devicePixelRatio || 1, 1.5);

            canvas.width = w * safeDpr;
            canvas.height = h * safeDpr;
            ctx.scale(safeDpr, safeDpr);

            particles = [];
            for (let i = 0; i < particleCount; i++) {
                // VISIBILITY FIX:
                const baseSize = isDesktop
                    ? (Math.random() * 2.5 + 0.8)
                    : (Math.random() * 2.5 + 1.5); // Slightly larger stars on mobile for visibility at lower DPR

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
                    opacity: isDesktop ? (Math.random() * 0.7 + 0.3) : (Math.random() * 0.6 + 0.4),
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

                // Long Tether Lines (Trails) - Re-enabled for Mobile Se2
                const lineRange = isDesktop ? 550 : 350; // Shorter range on mobile to save GPU fill-rate
                if (p.z < lineRange && proximityAlpha > 0.1) {
                    ctx.beginPath();
                    ctx.strokeStyle = palette.goldMain;

                    const trailOpacity = (1 - p.z / lineRange) * 0.4 * currentTwinkle * proximityAlpha;
                    ctx.globalAlpha = trailOpacity;
                    ctx.lineWidth = 0.8;
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

    return (
        <Container>
            <BackgroundLayer $visible={showNebula} />
            <Canvas ref={canvasRef} id="cinematic-starfield" />
        </Container>
    );
};

export default StarBackground;
