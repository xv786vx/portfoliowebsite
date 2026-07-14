import React, { useEffect, useRef, useMemo } from 'react';
import { Image as KonvaImage, Group } from 'react-konva';
import Konva from 'konva';
import { AsciiEngine } from '../utils/asciiMath';
import { generatePlanet, generateSun, generateBlackHole, generateAsteroid, generateComet, type PlanetProfile, type AsteroidProfile } from '../utils/celestialBodies';

interface AsciiNodeBodyProps {
  x: number;
  y: number;
  size: number;
  /** Multi-stop color palette (dark → bright) sampled by luminance */
  palette: string[];
  /** Per-planet surface profile (only used when type === 'planet'). */
  planetProfile?: PlanetProfile;
  /** Per-asteroid variety profile (only used when type === 'asteroid'). */
  asteroidProfile?: AsteroidProfile;
  /** Base rotation/animation speed multiplier for this body */
  speedMul: number;
  /** Angle (radians, screen space) from this body toward the black hole — the
   *  shared light source for every body in the system. Ignored for 'blackhole'. */
  lightAngle: number;
  isHovered: boolean;
  type: 'sun' | 'planet' | 'blackhole' | 'asteroid' | 'comet';
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const AsciiNodeBody: React.FC<AsciiNodeBodyProps> = ({
  x, y, size, palette, planetProfile, asteroidProfile, speedMul, lightAngle, isHovered, type, onClick, onMouseEnter, onMouseLeave
}) => {
  const imageRef = useRef<Konva.Image>(null);
  const animationId = useRef<number>(0);
  // Accumulated animation "phase", integrated frame-by-frame at the CURRENT
  // speed rather than computed as (elapsed wall time * current speed). The
  // generators derive rotation as time*rate — if we passed raw elapsed time
  // and let speed multiply it directly, changing speed on hover would multiply
  // the ENTIRE elapsed duration, snapping the rotation to a different angle
  // instantly. Integrating dt*speed each frame keeps the angle continuous;
  // only its rate of change speeds up.
  const phaseRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(Date.now());
  // Accumulates real elapsed ms since the last actual canvas redraw, so the
  // expensive part (784 fillText calls via engine.render) is capped to ~30fps
  // — chunky ASCII art doesn't need 60fps — while phaseRef above still
  // integrates every real frame, keeping motion/hover speed-up smooth.
  const drawAccRef = useRef<number>(0);
  
  // Create an off-screen canvas and engine.
  // 28×28 grid: good balance between chunky readable characters and enough
  // resolution for the irregular asteroid silhouette and black hole ring.
  const { canvas, ctx, engine } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width  = size * 2;  // 2× for crispness on HiDPI screens
    canvas.height = size * 2;
    const ctx = canvas.getContext('2d')!;

    const gridCols = 28;
    const gridRows = 28;
    const engine = new AsciiEngine(gridCols, gridRows);

    return { canvas, ctx, engine };
  }, [size]);

  useEffect(() => {
    const renderLoop = () => {
      const now = Date.now();
      // Clamp dt so a backgrounded/throttled tab doesn't produce one huge jump
      // in phase when it resumes.
      const dt = Math.min(0.1, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;

      // Hover feedback: brighten the palette and speed up the motion, instead
      // of destroying the palette by swapping to a flat white. Speed is baked
      // into the phase accumulation (see phaseRef above), so the generators
      // receive it as a plain, already-scaled elapsed time (speedMul=1).
      const brightness = isHovered ? 1.5 : 1.0;
      const speed = isHovered ? speedMul * 1.6 : speedMul;
      phaseRef.current += dt * speed;
      const time = phaseRef.current;

      // Cap the expensive redraw (784 fillText calls) to ~30fps; the phase
      // above still integrates every real frame so motion stays smooth.
      drawAccRef.current += dt * 1000;
      if (drawAccRef.current >= 1000 / 30) {
        drawAccRef.current = 0;

        if (type === 'planet' && planetProfile) {
          generatePlanet(engine, ctx, time, planetProfile, 1, brightness, lightAngle);
        } else if (type === 'sun') {
          generateSun(engine, ctx, time, palette, 1, brightness);
        } else if (type === 'blackhole') {
          generateBlackHole(engine, ctx, time, palette, 1, brightness, isHovered ? 1 : 0);
        } else if (type === 'asteroid' && asteroidProfile) {
          generateAsteroid(engine, ctx, time, asteroidProfile, 1, brightness, lightAngle);
        } else if (type === 'comet') {
          generateComet(engine, ctx, time, palette, 1, brightness, lightAngle);
        }

        // Notify Konva that the canvas texture has changed
        if (imageRef.current) {
          imageRef.current.getLayer()?.batchDraw();
        }
      }

      animationId.current = requestAnimationFrame(renderLoop);
    };

    animationId.current = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationId.current);
  }, [engine, ctx, canvas, palette, planetProfile, asteroidProfile, speedMul, lightAngle, isHovered, type]);

  return (
    <Group x={x} y={y}>
      <KonvaImage
        ref={imageRef}
        image={canvas}
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        onClick={onClick}
        onTap={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        // Circular hit region so clicks only register inside the body
        hitFunc={(ctx, shape) => {
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2 * 0.82, 0, Math.PI * 2, false);
          ctx.closePath();
          ctx.fillStrokeShape(shape);
        }}
      />
    </Group>
  );
};

export default AsciiNodeBody;
