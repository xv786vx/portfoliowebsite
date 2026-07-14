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

/** Per-planet visual profile: palette + surface parameters that make each of the
 *  category planets read as a distinct real world (Jupiter vs Neptune vs Mars vs
 *  Uranus) instead of near-identical spheres. */
export interface PlanetProfile {
  palette: string[];
  /** Amplitude of horizontal latitude banding (Jupiter high, Mars ~0). */
  bandStrength: number;
  /** Frequency of the banding (higher = more, thinner bands). */
  bandFreq: number;
  /** Surface noise scale (higher = more mottled/cratered terrain). */
  noiseScale: number;
  /** Axial tilt in radians applied after rotation (Uranus ~extreme). */
  tilt: number;
  /** Rotation-rate multiplier. */
  rotSpeed: number;
  /** Which way the body visibly spins — each category gets a distinct motion. */
  spin: 'horizontal' | 'vertical' | 'diagonal' | 'antidiagonal';
  /** Optional dark surface feature (Great Red Spot / Neptune dark spot). */
  spot?: { lon: number; lat: number; size: number; darken: number };
  /** Optional scattered circular features (craters / storm blotches). */
  craters?: { count: number; strength: number; seed: number };
}

export const PLANET_PROFILES: Record<string, PlanetProfile> = {
  // Jupiter — ochre gas giant, strong horizontal bands, fast spin, red spot +
  // a few circular storm blotches
  jupiter: {
    palette: ['#140f04', '#3a2c0d', '#6f5518', '#a98432', '#d6b25e', '#ecd79a', '#fbf1cf'],
    bandStrength: 0.22, bandFreq: 9.0, noiseScale: 1.6, tilt: 0.08, rotSpeed: 0.5,
    spin: 'horizontal',
    spot: { lon: 0.6, lat: -0.5, size: 0.5, darken: 0.35 },
    craters: { count: 4, strength: 0.18, seed: 11 },
  },
  // Neptune — deep icy blue, subtle bands, a dark storm spot + storm discolouration
  neptune: {
    palette: ['#03080f', '#0b2036', '#164a6e', '#2f83b0', '#79c0e0', '#c4e8f7', '#ffffff'],
    bandStrength: 0.05, bandFreq: 7.0, noiseScale: 2.2, tilt: 0.25, rotSpeed: 0.32,
    spin: 'vertical',
    spot: { lon: -0.8, lat: 0.4, size: 0.45, darken: 0.3 },
    craters: { count: 3, strength: 0.16, seed: 23 },
  },
  // Mars — rusty, near-zero bands, cratered/mottled surface; tumbles diagonally
  mars: {
    palette: ['#160805', '#3e1810', '#7a2c17', '#b5502a', '#d98b52', '#e9c39a', '#fff2e0'],
    bandStrength: 0.02, bandFreq: 6.0, noiseScale: 4.2, tilt: 0.35, rotSpeed: 0.3,
    spin: 'diagonal',
    craters: { count: 6, strength: 0.3, seed: 7 },
  },
  // Uranus — pale cyan, very smooth, extreme axial tilt; a few faint craters
  uranus: {
    palette: ['#04100c', '#0c2b22', '#1c5140', '#3f9bad', '#8fd6e0', '#c8f0f4', '#f0ffff'],
    bandStrength: 0.03, bandFreq: 5.0, noiseScale: 1.4, tilt: 1.55, rotSpeed: 0.28,
    spin: 'antidiagonal',
    craters: { count: 3, strength: 0.14, seed: 31 },
  },
};

/** Icy blue-grey cratered dwarf planet (Pluto/Ceres-like) — used for the small
 *  outer nodes that previously rendered as comets. */
export const DWARF_PLANET_PROFILE: PlanetProfile = {
  palette: ['#0a0e14', '#1c2733', '#33475a', '#5a7286', '#8aa6b8', '#bcd4e0', '#eef6fb'],
  bandStrength: 0.0, bandFreq: 5.0, noiseScale: 3.6, tilt: 0.4, rotSpeed: 0.25,
  spin: 'horizontal',
  craters: { count: 7, strength: 0.34, seed: 47 },
};

/** Bennu-like rocky greys: near-black → mid grey → light dusty grey */
export const ASTEROID_PALETTE = ['#070707', '#1c1c1c', '#333230', '#524f49', '#7a746a', '#a89f92', '#d0c8ba'];

/** Metallic / M-type asteroid: near-black → iron brown → bronze → warm tan */
export const METALLIC_ASTEROID_PALETTE = ['#080605', '#1e1712', '#3a2a1e', '#5c4530', '#87684a', '#b39678', '#dcc7ab'];

/** A distinct asteroid variety (silhouette + surface + palette). Two profiles are
 *  alternated across the asteroid nodes so neighbours don't look identical. */
export interface AsteroidProfile {
  palette: string[];
  /** Silhouette lumps: each adds amp·sin(freq·θ + phase) to the body radius. */
  lumps: { amp: number; freq: number; phase: number }[];
  baseR: number;      // base radius of the rocky body
  noiseScale: number; // surface roughness (crater/mottle frequency)
  rotSpeed: number;   // tumble rate
  tilt: number;       // fixed axial tilt
  flatten: number;    // flattening of the lower edge (0 = none)
}

export const ASTEROID_PROFILES: AsteroidProfile[] = [
  // Type A — carbonaceous grey (Bennu-like): rounded, lightly lumpy, flat base
  {
    palette: ASTEROID_PALETTE,
    lumps: [
      { amp: 0.12, freq: 3, phase: 0.5 },
      { amp: 0.08, freq: 5, phase: 2.1 },
      { amp: 0.06, freq: 7, phase: 4.3 },
    ],
    baseR: 0.85, noiseScale: 4.0, rotSpeed: 0.3, tilt: 0.4, flatten: 0.08,
  },
  // Type B — metallic bronze: elongated (strong 2-lobe), craggier, slower tumble
  {
    palette: METALLIC_ASTEROID_PALETTE,
    lumps: [
      { amp: 0.22, freq: 2, phase: 1.0 },
      { amp: 0.07, freq: 5, phase: 3.0 },
      { amp: 0.05, freq: 9, phase: 5.2 },
    ],
    baseR: 0.82, noiseScale: 5.5, rotSpeed: 0.22, tilt: 0.65, flatten: 0.0,
  },
];

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

/**
 * A handful of circular surface features (craters / storm blotches) fixed to the
 * surface in (lon, lat) space, so they rotate with the body. Returns a signed
 * luminance delta: a darkened bowl with a brighter rim — reads as a crater on a
 * rocky world and a circular discolouration/storm on a gassy one. `seed` picks a
 * deterministic, stable set of positions.
 */
export function craterField(lon: number, lat: number, seed: number, count: number): number {
  let d = 0;
  for (let i = 0; i < count; i++) {
    const cx = (hash(i * 1.7 + seed, seed * 0.3 + i) * 2 - 1) * Math.PI;       // longitude
    const cy = (hash(i * 2.9 + seed + 5, seed * 0.7 + i) * 2 - 1) * 1.2;       // latitude
    const cr = 0.22 + hash(i * 4.1 + seed + 9, i + seed) * 0.3;                // radius
    const dLon = Math.atan2(Math.sin(lon - cx), Math.cos(lon - cx));
    const dd = Math.sqrt(dLon * dLon + (lat - cy) * (lat - cy));
    if (dd < cr) {
      const t = dd / cr;                                            // 0 centre → 1 edge
      const floor = -(1 - t) * 0.6;                                 // darkened bowl
      const rim = Math.exp(-Math.pow((t - 0.82) / 0.14, 2)) * 0.7;  // bright rim
      d += floor + rim;
    }
  }
  return d;
}

// ─── Planet ───────────────────────────────────────────────────────────────────

export const generatePlanet = (
  engine: AsciiEngine,
  ctx: CanvasRenderingContext2D,
  time: number,
  profile: PlanetProfile,
  speedMul: number,
  brightness: number,
  lightAngle: number
) => {
  const A = time * profile.rotSpeed * speedMul;
  const tilt = profile.tilt;
  const palette = profile.palette;
  // Lit from the black hole's direction — every body in the system shares one
  // light source, so the whole scene reads as one gravitationally-bound world.
  const light = normalize([Math.cos(lightAngle) * 0.75, Math.sin(lightAngle) * 0.45, -0.65]);

  // Color varies by surface position (longitude) for multi-color regions
  const getColor = (lum: number, u: number, v: number): string => {
    // Mix palette position from luminance AND angular position for varied patches.
    // Floored so the night side samples a visible derived tone, never near-black.
    const angle = (Math.atan2(v, u) / Math.PI + 1) * 0.5; // 0..1
    const mix = Math.max(0.3, lum * 0.6 + angle * 0.4);
    const base = samplePalette(palette, mix);
    return brightness !== 1.0 ? brightenHex(base, brightness) : base;
  };

  engine.render(ctx, (_col, _row, u, v) => {
    const r2 = u * u + v * v;
    if (r2 > 1.0) return -1;
    const w = Math.sqrt(1.0 - r2);
    // Each planet spins about a different axis so no two read the same:
    //  horizontal → time drives the Y (vertical) axis (classic left↔right spin)
    //  vertical   → time drives the X (horizontal) axis (top↔bottom spin)
    //  diagonal / antidiagonal → time drives both axes (a tumbling roll)
    let nx = 0, ny = 0, nz = 0;
    switch (profile.spin) {
      case 'vertical':
        [nx, ny, nz] = rotateX(u, v, w, A);
        [nx, ny, nz] = rotateY(nx, ny, nz, tilt);
        break;
      case 'diagonal':
        [nx, ny, nz] = rotateY(u, v, w, A * 0.72);
        [nx, ny, nz] = rotateX(nx, ny, nz, A * 0.72 + tilt);
        break;
      case 'antidiagonal':
        [nx, ny, nz] = rotateY(u, v, w, A * 0.72);
        [nx, ny, nz] = rotateX(nx, ny, nz, -A * 0.72 + tilt);
        break;
      default: // horizontal
        [nx, ny, nz] = rotateY(u, v, w, A);
        [nx, ny, nz] = rotateX(nx, ny, nz, tilt);
    }
    const lon = Math.atan2(nx, nz);
    const lat = Math.asin(Math.max(-1, Math.min(1, ny)));
    const terrainNoise = fbm(lon * profile.noiseScale, lat * profile.noiseScale, 4);
    const banding = profile.bandStrength * Math.sin(lat * profile.bandFreq);
    let L = shade(nx, ny, nz, light);
    L = L * (0.6 + terrainNoise * 0.4 + banding);
    // Scattered circular craters / storm blotches modulate the lit surface, so
    // they read as craters (rocky worlds) or circular discolouration (gassy ones).
    if (profile.craters) {
      const feature = craterField(lon, lat, profile.craters.seed, profile.craters.count);
      L *= 1 + feature * profile.craters.strength;
    }
    // Ambient term (0.16 + terrain) keeps the unlit hemisphere a visible,
    // lightly-textured tone instead of dropping to an empty black glyph.
    L += 0.16 + terrainNoise * 0.08;
    // Optional dark surface feature (e.g. Great Red Spot / Neptune dark spot),
    // fixed to the surface so it rotates with the planet.
    if (profile.spot) {
      const dLon = Math.atan2(Math.sin(lon - profile.spot.lon), Math.cos(lon - profile.spot.lon));
      const dLat = lat - profile.spot.lat;
      const d = Math.sqrt(dLon * dLon + dLat * dLat);
      if (d < profile.spot.size) {
        const falloff = 1.0 - d / profile.spot.size;
        L *= 1.0 - profile.spot.darken * falloff * falloff;
      }
    }
    return Math.max(0.16, Math.min(1, L));
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
  brightness: number,
  flare: number = 0
) => {
  const swirl = time * 0.7 * speedMul;
  // On hover, let the accretion disk throw rotating outward bursts past the ring.
  const maxR = flare > 0 ? 1.4 : 1.05;

  // 3D tumble: the accretion disk is inclined and its tilt axis precesses while
  // the inclination gently breathes, so the ring reads as a disk tumbling on a
  // 3D axis. Screen (u,v) is projected into this disk frame → (du, dv).
  const prec = time * 0.22 * speedMul;
  const incl = 0.6 + 0.35 * Math.sin(time * 0.18 * speedMul); // ~0.25..0.95 rad
  const cosP = Math.cos(prec), sinP = Math.sin(prec);
  const invCosI = 1 / Math.cos(incl);
  const toDisk = (u: number, v: number): [number, number] => {
    const du = u * cosP + v * sinP;
    const dv = (-u * sinP + v * cosP) * invCosI; // foreshorten the minor axis
    return [du, dv];
  };

  // The event horizon is a screen-circular shadow. When the tumble tilts the disk
  // into an oval, the shadow takes on a dark-grey spherical rim/terminator so it
  // reads as a 3D ball; when the disk is face-on it stays a flat black circle (the
  // original look). Ramps in only at the more-tilted end of the tumble.
  const shadowR = 0.3;
  const ovalness = Math.max(0, Math.min(1, (invCosI - 1.2) / 0.5));

  const getColor = (lum: number, u: number, v: number): string => {
    const rs = Math.sqrt(u * u + v * v);
    // Shadow sphere shades as neutral grey (not palette-warm).
    if (rs < shadowR) {
      const bf = brightness !== 1.0 ? brightness : 1;
      const gc = Math.min(255, Math.round((lum * 340 + 15) * bf));
      return `rgb(${gc},${gc},${gc})`;
    }
    const [du, dv] = toDisk(u, v);
    const r = Math.sqrt(du * du + dv * dv);
    // Map radial position: inner edge → warm (orange/yellow), outer → cool (blue)
    const radialT = Math.max(0, Math.min(1, (r - 0.3) / 0.7));
    const warmCool = 1.0 - radialT; // 1 at inner edge, 0 at outer
    const t = warmCool * 0.8 + lum * 0.2;
    const base = samplePalette(palette, t);
    return brightness !== 1.0 ? brightenHex(base, brightness) : base;
  };

  engine.render(ctx, (_col, _row, u, v) => {
    const [du, dv] = toDisk(u, v);
    const r = Math.sqrt(du * du + dv * dv);
    if (r > maxR) return -1;

    // ── central event-horizon shadow (screen-circular) ──
    const rs = Math.sqrt(u * u + v * v);
    if (rs < shadowR) {
      // Pure black when face-on; a dark-grey rim + directional terminator fade in
      // with `ovalness`, giving the shadow the roundness of a 3D sphere.
      const nrm = rs / shadowR;
      const nz = Math.sqrt(Math.max(0, 1 - nrm * nrm)); // 1 at centre → 0 at rim
      const lit = Math.max(0, (u / shadowR) * -0.45 + (v / shadowR) * -0.5 + nz * 0.74);
      const rim = Math.pow(nrm, 4);                      // ~0 centre → 1 at rim
      const g = ovalness * (rim * 0.17 + lit * 0.05);
      return Math.max(0, Math.min(1, g));
    }

    const ringCenter = 0.55, ringWidth = 0.35;
    const ringDist = Math.abs(r - ringCenter) / ringWidth;
    let ringIntensity = Math.exp(-ringDist * ringDist * 3.0);
    const angle = Math.atan2(dv, du) + swirl;
    const crescentBias = 0.5 + 0.5 * Math.cos(angle + Math.PI * 0.75);
    ringIntensity *= (0.3 + crescentBias * 0.7);
    let outerGlow = 0;
    if (r > ringCenter + ringWidth * 0.5) {
      const falloff = (r - ringCenter - ringWidth * 0.5) / 0.4;
      outerGlow = 0.15 * Math.exp(-falloff * falloff * 2.0) * crescentBias;
    }
    let innerGlow = 0;
    if (r < ringCenter && r > shadowR) {
      const t = (r - shadowR) / (ringCenter - shadowR);
      innerGlow = 0.2 * t * crescentBias;
    }
    // Hover flare-ups: sporadic, slow prominences that arc outward while hugging
    // the disk's curvature. Only 1–2 fire at a time, from a couple of drifting
    // sources whose on/off envelope is dark most of the time.
    let burst = 0;
    if (flare > 0 && r > ringCenter) {
      const rawAngle = Math.atan2(dv, du);
      for (let k = 0; k < 2; k++) {
        const env = Math.pow(Math.max(0, Math.sin(time * 0.6 + k * 2.1)), 4);
        if (env < 0.03) continue;
        const src = time * 0.05 + k * Math.PI * 0.85;
        const along = src + 1.7 * (r - ringCenter);
        let dAng = rawAngle - along;
        dAng = Math.atan2(Math.sin(dAng), Math.cos(dAng));
        const width = 0.22;
        const angProfile = Math.exp(-(dAng * dAng) / (width * width));
        const radial = Math.exp(-Math.pow((r - (ringCenter + 0.3)) * 2.2, 2));
        burst += flare * env * angProfile * radial * 0.85;
      }
    }
    return Math.max(0, Math.min(1, ringIntensity * 0.85 + outerGlow + innerGlow + burst));
  }, getColor);
};


// ─── Asteroid ─────────────────────────────────────────────────────────────────

export const generateAsteroid = (
  engine: AsciiEngine,
  ctx: CanvasRenderingContext2D,
  time: number,
  profile: AsteroidProfile,
  speedMul: number,
  brightness: number,
  lightAngle: number
) => {
  const A = time * profile.rotSpeed * speedMul;
  const B = profile.tilt;
  const palette = profile.palette;
  const light = normalize([Math.cos(lightAngle) * 0.65, Math.sin(lightAngle) * 0.5, -0.75]);

  // Asteroids: vary tones by surface noise (floored so the shadowed side stays a
  // visible dusty tone rather than dropping to black).
  const getColor = (lum: number, u: number, v: number): string => {
    const noiseVal = noise2D(u * 4 + A, v * 4) * 0.3;
    const t = Math.max(0.32, Math.min(1, lum + noiseVal));
    const base = samplePalette(palette, t);
    return brightness !== 1.0 ? brightenHex(base, brightness) : base;
  };

  engine.render(ctx, (_col, _row, u, v) => {
    const angle = Math.atan2(v, u);
    const baseR = Math.sqrt(u * u + v * v);
    if (baseR > 1.1) return -1;
    const rotAngle = angle + A * 0.5;
    let lumpSum = 0;
    for (const l of profile.lumps) lumpSum += l.amp * Math.sin(rotAngle * l.freq + l.phase);
    const flatBottom = v > 0 ? profile.flatten * v : 0;
    const irregularR = profile.baseR + lumpSum - flatBottom;
    if (baseR > irregularR) return -1;
    const normR = baseR / irregularR;
    const w = Math.sqrt(Math.max(0, 1.0 - normR * normR));
    let [nx, ny, nz] = rotateY(u / irregularR, v / irregularR, w, A);
    [nx, ny, nz] = rotateX(nx, ny, nz, B);
    const lon = Math.atan2(nx, nz);
    const lat = Math.asin(Math.max(-1, Math.min(1, ny)));
    const rockNoise = fbm(lon * profile.noiseScale, lat * profile.noiseScale, 3);
    let L = shade(nx, ny, nz, light);
    L = L * (0.5 + rockNoise * 0.4) + 0.16 + rockNoise * 0.08;
    return Math.max(0.16, Math.min(1, L));
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
    // Floored so even the faint icy body/tail keeps a visible blue instead of black.
    const base = samplePalette(palette, Math.max(0.28, lum));
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
