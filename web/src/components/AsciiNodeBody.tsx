import React, { useEffect, useRef, useMemo } from 'react';
import { Image as KonvaImage, Group } from 'react-konva';
import Konva from 'konva';
import { AsciiEngine } from '../utils/asciiMath';
import { generatePlanet, generateSun, generateBlackHole, generateAsteroid, generateComet, type PlanetProfile, type AsteroidProfile } from '../utils/celestialBodies';
import { registerAsciiTicker, markLayerDirty } from '../utils/asciiScheduler';

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
  /** 0-3 spin-axis/direction selector for asteroids (seeded per node). */
  spinVariant?: number;
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
  x, y, size, palette, planetProfile, asteroidProfile, spinVariant = 0, speedMul, lightAngle, isHovered, type, onClick, onMouseEnter, onMouseLeave
}) => {
  const imageRef = useRef<Konva.Image>(null);
  // Accumulated animation "phase", integrated frame-by-frame at the CURRENT
  // speed rather than computed as (elapsed wall time * current speed). The
  // generators derive rotation as time*rate — if we passed raw elapsed time
  // and let speed multiply it directly, changing speed on hover would multiply
  // the ENTIRE elapsed duration, snapping the rotation to a different angle
  // instantly. Integrating dt*speed each frame keeps the angle continuous;
  // only its rate of change speeds up.
  const phaseRef = useRef<number>(0);

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
    // Driven by the shared ASCII scheduler (one rAF loop for every body), which
    // integrates phase each frame and gates the expensive canvas redraw to a
    // single shared 30fps tick — see utils/asciiScheduler.ts. `draw` is true
    // only on that tick; the batchDraw is coalesced by the scheduler.
    const tick = (dt: number, draw: boolean) => {
      // Hover feedback: brighten the palette and speed up the motion, instead
      // of destroying the palette by swapping to a flat white. Speed is baked
      // into the phase accumulation (see phaseRef above), so the generators
      // receive it as a plain, already-scaled elapsed time (speedMul=1).
      // 1.9× so the boost still reads on already-light palettes (e.g. the
      // steel-blue asteroid) whose lit side otherwise clamps near white at 1.5×.
      const brightness = isHovered ? 1.9 : 1.0;
      const speed = isHovered ? speedMul * 1.6 : speedMul;
      phaseRef.current += dt * speed;
      if (!draw) return;
      const time = phaseRef.current;

      if (type === 'planet' && planetProfile) {
        generatePlanet(engine, ctx, time, planetProfile, 1, brightness, lightAngle);
      } else if (type === 'sun') {
        generateSun(engine, ctx, time, palette, 1, brightness);
      } else if (type === 'blackhole') {
        generateBlackHole(engine, ctx, time, palette, 1, brightness, isHovered ? 1 : 0);
      } else if (type === 'asteroid' && asteroidProfile) {
        generateAsteroid(engine, ctx, time, asteroidProfile, 1, brightness, lightAngle, spinVariant);
      } else if (type === 'comet') {
        generateComet(engine, ctx, time, palette, 1, brightness, lightAngle);
      }

      // Canvas texture changed — ask the scheduler to redraw this node's layer
      // once (coalesced across all bodies into a single batchDraw per tick).
      markLayerDirty(imageRef.current?.getLayer());
    };

    return registerAsciiTicker(tick);
  }, [engine, ctx, canvas, palette, planetProfile, asteroidProfile, spinVariant, speedMul, lightAngle, isHovered, type]);

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
