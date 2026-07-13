import { AsciiEngine, rotateX, rotateY, normalize, samplePalette, brightenHex } from './asciiMath';

// ─── Palettes (dark → bright, multi-stop) ──────────────────────────────────────
// Each is sampled by luminance via samplePalette(). They evoke the reference art
// in src/assets: the EHT black hole, Pluto (planets), Bennu (asteroids).

/** EHT accretion disk: black core → deep red → orange → gold → white hot-spot */
export const BLACKHOLE_PALETTE = ['#000000', '#2a0700', '#7a1e00', '#d64500', '#ff8c1a', '#ffd27f', '#fff6e0'];

/** Distinct natural planet palettes; one is chosen per node by id hash */
export const PLANET_PALETTES: string[][] = [
  // Pluto-like: dark tan → rust → cream → icy blue-white
  ['#1a120b', '#4a2f20', '#8a5a3c', '#c99b6e', '#e9d8b8', '#cfe3f2', '#ffffff'],
  // Rusty red / Mars-like
  ['#160805', '#3e1810', '#7a2c17', '#b5502a', '#d98b52', '#e9c39a', '#fff2e0'],
  // Icy blue-white / Neptune-like
  ['#03080f', '#0b2036', '#164a6e', '#2f83b0', '#79c0e0', '#c4e8f7', '#ffffff'],
  // Ochre / desert gas-giant
  ['#140f04', '#3a2c0d', '#6f5518', '#a98432', '#d6b25e', '#ecd79a', '#fbf1cf'],
  // Verdant / teal
  ['#04100c', '#0c2b22', '#1c5140', '#2f8567', '#63b892', '#b0e6cf', '#f0fff6'],
];

/** Bennu-like rocky greys: near-black → mid grey → light dusty grey */
export const ASTEROID_PALETTE = ['#070707', '#1c1c1c', '#333230', '#524f49', '#7a746a', '#a89f92', '#d0c8ba'];

/** Icy comet: near-black → deep blue → cyan → icy white */
export const COMET_PALETTE = ['#02040a', '#071a33', '#123f66', '#2f7fb5', '#77c6ea', '#c6ecfb', '#ffffff'];

/** Golden star / sun */
export const SUN_PALETTE = ['#1a0500', '#5c1f00', '#b35400', '#ff8c1a', '#ffcf5c', '#fff2c0', '#ffffff'];

/** Deterministic 32-bit hash of a string — stable per-node selection (no flicker) */
export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function shade(
  nx: number, ny: number, nz: number,
  light: [number, number, number]
): number {
  return Math.max(0, nx * light[0] + ny * light[1] + nz * light[2]);
}

export function hash(x: number, y: number): number {
  let h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

export function noise2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

export function fbm(x: number, y: number, octaves: number): number {
  let val = 0, amp = 0.5, freq = 1.0;
  for (let i = 0; i < octaves; i++) {
    val += amp * noise2D(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2.0;
  }
  return val;
}

// ─── Planet ───────────────────────────────────────────────────────────────────

export const generatePlanet = (
  engine: AsciiEngine,
  ctx: CanvasRenderingContext2D,
  time: number,
  palette: string[],
  speedMul: number,
  brightness: number,
  lightAngle: number
) => {
  const A = time * 0.35 * speedMul;
  const B = 0.25;
  // Lit from the black hole's direction — every body in the system shares one
  // light source, so the whole scene reads as one gravitationally-bound world.
  const light = normalize([Math.cos(lightAngle) * 0.75, Math.sin(lightAngle) * 0.45, -0.65]);

  // Color varies by surface position (longitude) for multi-color regions
  const getColor = (lum: number, u: number, v: number): string => {
    // Mix palette position from luminance AND angular position for varied patches
    const angle = (Math.atan2(v, u) / Math.PI + 1) * 0.5; // 0..1
    const mix = lum * 0.6 + angle * 0.4;
    const base = samplePalette(palette, mix);
    return brightness !== 1.0 ? brightenHex(base, brightness) : base;
  };

  engine.render(ctx, (_col, _row, u, v) => {
    const r2 = u * u + v * v;
    if (r2 > 1.0) return -1;
    const w = Math.sqrt(1.0 - r2);
    let [nx, ny, nz] = rotateY(u, v, w, A);
    [nx, ny, nz] = rotateX(nx, ny, nz, B);
    const lon = Math.atan2(nx, nz);
    const lat = Math.asin(Math.max(-1, Math.min(1, ny)));
    const terrainNoise = fbm(lon * 3.0, lat * 3.0, 4);
    const banding = 0.06 * Math.sin(lat * 12.0);
    let L = shade(nx, ny, nz, light);
    L = L * (0.65 + terrainNoise * 0.45 + banding) + 0.08;
    return Math.max(0, Math.min(1, L));
  }, getColor);
};


// ─── Sun ──────────────────────────────────────────────────────────────────────

export const generateSun = (
  engine: AsciiEngine,
  ctx: CanvasRenderingContext2D,
  time: number,
  palette: string[],
  speedMul: number,
  brightness: number
) => {
  const A = time * 0.8 * speedMul;
  const B = time * 0.12 * speedMul;
  const light = normalize([0.5, -0.3, -0.8]);

  const getColor = (lum: number, _u: number, _v: number): string => {
    const base = samplePalette(palette, lum);
    return brightness !== 1.0 ? brightenHex(base, brightness) : base;
  };

  engine.render(ctx, (_col, _row, u, v) => {
    const pulse = 1.0 + 0.06 * Math.sin(time * 3.0);
    const pu = u / pulse, pv = v / pulse;
    const r2 = pu * pu + pv * pv;
    if (r2 > 1.0) return -1;
    const w = Math.sqrt(1.0 - r2);
    let [nx, ny, nz] = rotateY(pu, pv, w, A);
    [nx, ny, nz] = rotateX(nx, ny, nz, B);
    const lon = Math.atan2(nx, nz);
    const lat = Math.asin(Math.max(-1, Math.min(1, ny)));
    const cells = fbm(lon * 2.5 + time * 0.3, lat * 2.5, 4);
    const granulation = noise2D(lon * 8.0 + time * 0.8, lat * 6.0) * 0.3;
    const spots = Math.pow(noise2D(lon * 1.5 + 5.0, lat * 1.5 + 3.0), 3.0) * 0.4;
    const flares = Math.max(0, Math.sin(lon * 5 + time * 3.0) * Math.cos(lat * 4 - time * 1.5)) * 0.15;
    const directional = shade(nx, ny, nz, light);
    const limbDarkening = Math.pow(w, 0.5);
    let L = (directional * 0.6 + 0.25) * limbDarkening;
    L = L * (0.55 + cells * 0.5 + granulation) - spots + flares;
    return Math.max(0.05, Math.min(1, L));
  }, getColor);
};


// ─── Black Hole ───────────────────────────────────────────────────────────────

export const generateBlackHole = (
  engine: AsciiEngine,
  ctx: CanvasRenderingContext2D,
  time: number,
  palette: string[],
  speedMul: number,
  brightness: number
) => {
  const swirl = time * 0.7 * speedMul;

  // Black hole uses position-based coloring: inner ring is orange/yellow, outer is dark blue
  const getColor = (lum: number, u: number, v: number): string => {
    const r = Math.sqrt(u * u + v * v);
    // Map radial position: inner edge → warm (orange/yellow), outer → cool (blue)
    const radialT = Math.max(0, Math.min(1, (r - 0.3) / 0.7));
    const warmCool = 1.0 - radialT; // 1 at inner edge, 0 at outer
    // Blend palette: low index = cool/dark, high index = warm/bright
    const t = warmCool * 0.8 + lum * 0.2;
    const base = samplePalette(palette, t);
    return brightness !== 1.0 ? brightenHex(base, brightness) : base;
  };

  engine.render(ctx, (_col, _row, u, v) => {
    const r = Math.sqrt(u * u + v * v);
    if (r > 1.05) return -1;
    const horizonR = 0.3;
    if (r < horizonR) return 0.0;
    const ringCenter = 0.55, ringWidth = 0.35;
    const ringDist = Math.abs(r - ringCenter) / ringWidth;
    let ringIntensity = Math.exp(-ringDist * ringDist * 3.0);
    const angle = Math.atan2(v, u) + swirl;
    const crescentBias = 0.5 + 0.5 * Math.cos(angle + Math.PI * 0.75);
    ringIntensity *= (0.3 + crescentBias * 0.7);
    let outerGlow = 0;
    if (r > ringCenter + ringWidth * 0.5) {
      const falloff = (r - ringCenter - ringWidth * 0.5) / 0.4;
      outerGlow = 0.15 * Math.exp(-falloff * falloff * 2.0) * crescentBias;
    }
    let innerGlow = 0;
    if (r < ringCenter && r > horizonR) {
      const t = (r - horizonR) / (ringCenter - horizonR);
      innerGlow = 0.2 * t * crescentBias;
    }
    return Math.max(0, Math.min(1, ringIntensity * 0.85 + outerGlow + innerGlow));
  }, getColor);
};


// ─── Asteroid ─────────────────────────────────────────────────────────────────

export const generateAsteroid = (
  engine: AsciiEngine,
  ctx: CanvasRenderingContext2D,
  time: number,
  palette: string[],
  speedMul: number,
  brightness: number,
  lightAngle: number
) => {
  const A = time * 0.3 * speedMul;
  const B = 0.4;
  const light = normalize([Math.cos(lightAngle) * 0.65, Math.sin(lightAngle) * 0.5, -0.75]);

  // Asteroids: vary grey tones by surface noise
  const getColor = (lum: number, u: number, v: number): string => {
    const noiseVal = noise2D(u * 4 + A, v * 4) * 0.3;
    const t = Math.max(0, Math.min(1, lum + noiseVal));
    const base = samplePalette(palette, t);
    return brightness !== 1.0 ? brightenHex(base, brightness) : base;
  };

  engine.render(ctx, (_col, _row, u, v) => {
    const angle = Math.atan2(v, u);
    const baseR = Math.sqrt(u * u + v * v);
    if (baseR > 1.1) return -1;
    const rotAngle = angle + A * 0.5;
    const lump1 = 0.12 * Math.sin(rotAngle * 3.0 + 0.5);
    const lump2 = 0.08 * Math.sin(rotAngle * 5.0 + 2.1);
    const lump3 = 0.06 * Math.cos(rotAngle * 7.0 + 4.3);
    const flatBottom = v > 0 ? 0.08 * v : 0;
    const irregularR = 0.85 + lump1 + lump2 + lump3 - flatBottom;
    if (baseR > irregularR) return -1;
    const normR = baseR / irregularR;
    const w = Math.sqrt(Math.max(0, 1.0 - normR * normR));
    let [nx, ny, nz] = rotateY(u / irregularR, v / irregularR, w, A);
    [nx, ny, nz] = rotateX(nx, ny, nz, B);
    const lon = Math.atan2(nx, nz);
    const lat = Math.asin(Math.max(-1, Math.min(1, ny)));
    const rockNoise = fbm(lon * 4.0, lat * 4.0, 3);
    let L = shade(nx, ny, nz, light);
    L = L * (0.55 + rockNoise * 0.45) + 0.06;
    return Math.max(0, Math.min(1, L));
  }, getColor);
};


// ─── Comet ──────────────────────────────────────────────────────────────────
// A small bright icy nucleus in the lower-right with a shimmering tail streaming
// toward the upper-left. The tail flickers over time via noise for a "streaming"
// feel; the nucleus rotates slowly like a small rocky body.

export const generateComet = (
  engine: AsciiEngine,
  ctx: CanvasRenderingContext2D,
  time: number,
  palette: string[],
  speedMul: number,
  brightness: number,
  lightAngle: number
) => {
  const A = time * 0.4 * speedMul;
  const B = 0.4;
  const light = normalize([Math.cos(lightAngle) * 0.7, Math.sin(lightAngle) * 0.5, -0.6]);

  // The nucleus sits toward the black hole (the light source); the tail
  // streams away from it — like a real comet, whose tail always points away
  // from the sun regardless of the comet's direction of travel.
  const nucX = Math.cos(lightAngle) * 0.42, nucY = Math.sin(lightAngle) * 0.42;
  const nucR = 0.42;                // head radius
  const tailDx = -Math.cos(lightAngle), tailDy = -Math.sin(lightAngle);

  const getColor = (lum: number, _u: number, _v: number): string => {
    const base = samplePalette(palette, lum);
    return brightness !== 1.0 ? brightenHex(base, brightness) : base;
  };

  engine.render(ctx, (_col, _row, u, v) => {
    const du = u - nucX;
    const dv = v - nucY;
    const baseR = Math.sqrt(du * du + dv * dv);

    // ── icy nucleus ──
    if (baseR <= nucR) {
      const normR = baseR / nucR;
      const w = Math.sqrt(Math.max(0, 1.0 - normR * normR));
      let [nx, ny, nz] = rotateY(du / nucR, dv / nucR, w, A);
      [nx, ny, nz] = rotateX(nx, ny, nz, B);
      const lon = Math.atan2(nx, nz);
      const lat = Math.asin(Math.max(-1, Math.min(1, ny)));
      const iceNoise = fbm(lon * 4.0, lat * 4.0, 3);
      let L = shade(nx, ny, nz, light);
      L = L * (0.55 + iceNoise * 0.4) + 0.25; // brighter than asteroid (icy)
      return Math.max(0, Math.min(1, L));
    }

    // ── streaming tail ──
    // project the point onto the tail axis; keep only the wedge behind the head
    const along = du * tailDx + dv * tailDy;      // >0 = in tail direction
    const perp = du * tailDy - dv * tailDx;       // signed distance off-axis
    if (along <= 0) return -1;
    const tailLen = 1.2;
    if (along > tailLen) return -1;
    const t = along / tailLen;                    // 0 at head → 1 at tip
    const halfWidth = 0.16 + t * 0.34;            // widening cone
    if (Math.abs(perp) > halfWidth) return -1;

    const edge = 1.0 - Math.abs(perp) / halfWidth; // 1 on axis → 0 at edge
    const flicker = 0.55 + 0.45 * noise2D(along * 6.0 - time * 2.2, perp * 5.0 + time * 0.5);
    let L = (1.0 - t) * edge * flicker;
    // sparse, wispy tail: drop many cells so it reads as streaks, not a solid cone
    if (L < 0.18) return -1;
    return Math.max(0, Math.min(1, L * 0.9));
  }, getColor);
};
