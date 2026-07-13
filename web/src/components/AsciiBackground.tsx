import React, { useEffect, useRef } from 'react';
import { renderBackground, spawnShootingStar, type ShootingStar } from '../utils/asciiBackground';

/**
 * Full-viewport animated ASCII nebula/star field rendered onto a single DOM
 * <canvas> that sits BEHIND the Konva stage (z-index 0, non-interactive).
 */
const AsciiBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ~12px per character cell; recomputed on resize.
    let cols = 0;
    let rows = 0;
    const CELL = 12;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      cols = Math.max(1, Math.ceil(w / CELL));
      rows = Math.max(1, Math.ceil(h / CELL));
    };
    resize();
    window.addEventListener('resize', resize);

    // Subtle parallax: nebula/stars drift a few px opposite the mouse, a cheap
    // depth cue that makes the field read as a 3D space rather than a flat sticker.
    const mouseTarget = { x: 0, y: 0 };
    const parallax = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Ambient "life": an occasional shooting star streaking across the field.
    let stars: ShootingStar[] = [];
    let nextSpawn = 3 + Math.random() * 5;

    // Caps the expensive full-viewport redraw (every cell, every frame) to
    // ~30fps. Parallax lerp and shooting-star bookkeeping stay on the real
    // per-frame clock (cheap), so drift/spawn timing remains smooth.
    let drawAcc = 0;
    let lastTick = Date.now();

    const startTime = Date.now();
    const loop = () => {
      const now = Date.now();
      const dtMs = now - lastTick;
      lastTick = now;
      const time = (now - startTime) * 0.001;

      parallax.x += (mouseTarget.x - parallax.x) * 0.02;
      parallax.y += (mouseTarget.y - parallax.y) * 0.02;

      if (time > nextSpawn) {
        stars.push(spawnShootingStar(time));
        nextSpawn = time + 5 + Math.random() * 8;
      }
      stars = stars.filter((s) => time - s.startTime < s.duration);

      drawAcc += dtMs;
      if (drawAcc >= 1000 / 30) {
        drawAcc = 0;
        renderBackground(ctx, cols, rows, time, stars, parallax);
      }

      animationId.current = requestAnimationFrame(loop);
    };
    animationId.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        // Do NOT force pixelated here; keep the ASCII crisp but smooth.
        imageRendering: 'auto',
      }}
    />
  );
};

export default AsciiBackground;
