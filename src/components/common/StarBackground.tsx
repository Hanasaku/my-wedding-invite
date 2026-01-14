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
        const particleCount = 120;

        const init = () => {
            w = canvas.width = document.documentElement.clientWidth;
            h = canvas.height = document.documentElement.clientHeight;
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: Math.random() * 2 + 0.5,
                    speed: Math.random() * 0.5 + 0.1,
                    angle: Math.random() * Math.PI * 2,
                    spin: (Math.random() - 0.5) * 0.01,
                    color: Math.random() > 0.5 ? palette.goldMain : palette.white,
                    opacity: Math.random(),
                    phase: Math.random() * Math.PI * 2,
                });
            }
        };

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, w, h);
            const centerX = w / 2;
            const centerY = h / 2;

            particles.forEach((p) => {
                p.angle += p.spin;
                p.x += Math.cos(p.angle) * p.speed;
                p.y += Math.sin(p.angle) * p.speed;

                // Wrapping around edges
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                p.phase += 0.02;
                let currentOpacity = ((Math.sin(p.phase) + 1) / 2) * p.opacity;

                ctx.beginPath();
                ctx.fillStyle = p.color;
                ctx.globalAlpha = currentOpacity;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                let dist = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
                if (dist < 200) {
                    ctx.beginPath();
                    ctx.strokeStyle = palette.goldMain;
                    ctx.globalAlpha = currentOpacity * 0.1;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(centerX, centerY);
                    ctx.stroke();
                }
            });
            requestAnimationFrame(draw);
        };

        let resizeTimer: number;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(init, 200);
        };

        window.addEventListener('resize', handleResize);
        init();
        const animationId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return <Canvas ref={canvasRef} id="bg-canvas" />;
};

export default StarBackground;
