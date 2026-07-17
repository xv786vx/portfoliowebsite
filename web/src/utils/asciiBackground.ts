import { fbm, hash } from './celestialBodies';

// ─── Animated ASCII nebula background ───────────────────────────────────────
// Recreates the old pixel wallpaper (a dark diagonal nebula band + twinkling
// stars on black) as a VERY DARK animated ASCII field. One full-viewport canvas.

// Nebula cloud colors — two vivid purple families the cloud drifts between
// across the field (and slowly in time) so it reads as a colourful purple
// nebula rather than a flat band: deep indigo ↔ violet-magenta, faint → bright.
const NEBULA_A_LOW: [number, number, number] = [22, 14, 54];
const NEBULA_A_HIGH: [number, number, number] = [96, 66, 208];
const NEBULA_B_LOW: [number, number, number] = [44, 14, 66];
const NEBULA_B_HIGH: [number, number, number] = [170, 70, 212];
// Sparse density ramp, faint → slightly denser.
const NEBULA_CHARS = '.:*+%'.split('');

type RGB = [number, number, number];
function lerp3(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function rgbStr(c: RGB): string {
  return `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
}

const STAR_GLYPHS = ['+', '×', '·', '+'];

// ─── Shooting stars ─────────────────────────────────────────────────────────
// Occasional bright streaks crossing the field — cheap "ambient life" cue.

export interface ShootingStar {
  x0: number; // normalized start position (0..1)
  y0: number;
  angle: number; // radians, direction of travel
  speed: number; // normalized units per second
  startTime: number; // seconds, matches the render clock
  duration: number; // seconds
}

/** Spawn a new shooting star starting just off the top-left, heading down-right. */
export function spawnShootingStar(time: number): ShootingStar {
  const angle = Math.PI * 0.22 + Math.random() * Math.PI * 0.12; // gentle down-right diagonal
  return {
    x0: Math.random() * 0.5 - 0.1,
    y0: -0.05 - Math.random() * 0.1,
    angle,
    speed: 1.0 + Math.random() * 0.5,
    startTime: time,
    duration: 0.8 + Math.random() * 0.35,
  };
}

function drawShootingStar(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  cw: number,
  ch: number,
  star: ShootingStar,
  time: number
) {
  const t = (time - star.startTime) / star.duration;
  if (t < 0 || t > 1) return;
  const fade = Math.sin(Math.PI * t); // fades in, then out
  const dist = t * star.speed;
  const hx = star.x0 + Math.cos(star.angle) * dist;
  const hy = star.y0 + Math.sin(star.angle) * dist;

  const STEPS = 6;
  const trailLen = 0.05;
  for (let i = 0; i < STEPS; i++) {
    const back = (i / STEPS) * trailLen;
    const px = hx - Math.cos(star.angle) * back;
    const py = hy - Math.sin(star.angle) * back;
    if (px < 0 || px > 1 || py < 0 || py > 1) continue;
    const alpha = fade * (1 - i / STEPS);
    if (alpha <= 0.02) continue;
    const b = Math.floor(170 + 80 * fade);
    ctx.fillStyle = `rgba(${b},${b},${Math.floor(b * 0.94)},${alpha.toFixed(3)})`;
    ctx.fillText(i === 0 ? '✹' : '·', Math.floor(px * cols) * cw, Math.floor(py * rows) * ch);
  }
}

/**
 * Paint one frame of the nebula/star field onto a 2D context.
 * @param cols/rows       character grid dimensions
 * @param time            seconds (drives drift + twinkle)
 * @param shootingStars   active shooting stars to overlay this frame
 * @param parallax        subtle -1..1 drift offset (e.g. driven by mouse position)
 */
export function renderBackground(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  time: number,
  shootingStars: ShootingStar[] = [],
  parallax: { x: number; y: number } = { x: 0, y: 0 }
) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const cw = W / cols;
  const ch = H / rows;

  // Clear/fill at identity transform, THEN translate — so the parallax shift
  // never reveals a gap (the base is uniformly black either way).
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.font = `${Math.floor(ch * 1.05)}px "Roboto Mono", "Courier New", monospace`;

  const MAX_SHIFT_PX = 16;
  ctx.save();
  ctx.translate(parallax.x * MAX_SHIFT_PX, parallax.y * MAX_SHIFT_PX);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const u = col / cols;
      const v = row / rows;

      // ── nebula band (slightly diagonal), drifting horizontally over time ──
      const bandCenter = 0.5 + 0.07 * Math.sin(u * 3.0 + 0.6);
      const band = Math.exp(-Math.pow((v - bandCenter) / 0.3, 2));
      const n = fbm(u * 5.0 + time * 0.04, v * 3.0 - time * 0.015, 4);
      let density = (n * 1.3 - 0.35) * band;
      density = Math.max(0, Math.min(1, density));
      if (density > 0.08) {
        const ci = Math.min(NEBULA_CHARS.length - 1, Math.floor(density * NEBULA_CHARS.length));
        // Hue drifts across the field (and slowly over time) so the cloud
        // shifts between the cyan-blue and violet-magenta families.
        const hueT = 0.5 + 0.5 * Math.sin(u * 2.4 + v * 1.3 + time * 0.05);
        const low = lerp3(NEBULA_A_LOW, NEBULA_B_LOW, hueT);
        const high = lerp3(NEBULA_A_HIGH, NEBULA_B_HIGH, hueT);
        ctx.fillStyle = rgbStr(lerp3(low, high, density));
        ctx.fillText(NEBULA_CHARS[ci], col * cw, row * ch);
      }

      // ── stars (stable per-cell hash → no flicker in position; twinkle in brightness) ──
      const hs = hash(col, row);
      if (hs > 0.972) {
        const tw = 0.45 + 0.55 * Math.sin(time * 1.8 + hs * 137.0);
        if (hs > 0.9955) {
          // rare bright 4-point sparkle (bright cream/white)
          const b = 150 + Math.floor(105 * tw);
          ctx.fillStyle = `rgb(${b},${b},${Math.floor(b * 0.9)})`;
          ctx.fillText('✦', col * cw, row * ch);
        } else {
          // common star — brighter, tinted warm gold or cool blue for colour
          const g = 70 + Math.floor(120 * tw);
          const warm = Math.floor(hs * 997) % 3 === 0;
          ctx.fillStyle = warm
            ? `rgb(${g},${Math.floor(g * 0.82)},${Math.floor(g * 0.55)})`
            : `rgb(${Math.floor(g * 0.78)},${Math.floor(g * 0.62)},${g})`;
          ctx.fillText(STAR_GLYPHS[Math.floor(hs * 997) % STAR_GLYPHS.length], col * cw, row * ch);
        }
      }
    }
  }

  for (const star of shootingStars) {
    drawShootingStar(ctx, cols, rows, cw, ch, star, time);
  }

  ctx.restore();
}
