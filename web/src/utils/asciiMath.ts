// ASCII luminance palette — from dark/sparse to bright/dense
const CHAR_PALETTE = ' .,:;i1tfLCG08@#'.split('');
const PALETTE_LEN = CHAR_PALETTE.length;

// ─── Math helpers ────────────────────────────────────────────────────────────

export function rotateY(x: number, y: number, z: number, a: number): [number, number, number] {
  const cos = Math.cos(a), sin = Math.sin(a);
  return [x * cos + z * sin, y, -x * sin + z * cos];
}

export function rotateX(x: number, y: number, z: number, b: number): [number, number, number] {
  const cos = Math.cos(b), sin = Math.sin(b);
  return [x, y * cos - z * sin, y * sin + z * cos];
}

export function normalize(v: [number, number, number]): [number, number, number] {
  const m = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1;
  return [v[0] / m, v[1] / m, v[2] / m];
}

export function dot(a: [number, number, number], b: [number, number, number]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

// ─── Color helpers ────────────────────────────────────────────────────────────

/** Parse a hex color (#rrggbb or #rgb) to [r, g, b] in 0-255 */
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

/** Linearly interpolate between two hex colors */
export function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

/** Sample a multi-stop color palette at position t ∈ [0, 1] */
export function samplePalette(colors: string[], t: number): string {
  if (colors.length === 1) return colors[0];
  const clamped = Math.max(0, Math.min(1, t));
  const segment = clamped * (colors.length - 1);
  const i = Math.floor(segment);
  const frac = segment - i;
  if (i >= colors.length - 1) return colors[colors.length - 1];
  return lerpColor(colors[i], colors[i + 1], frac);
}

/** Parse either "#rgb"/"#rrggbb" hex or "rgb(r,g,b)" into [r, g, b] 0-255 */
function parseColor(color: string): [number, number, number] {
  if (color.startsWith('#')) return hexToRgb(color);
  const m = color.match(/rgb\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
  if (m) return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
  return [0, 0, 0];
}

/**
 * Brighten a color (hex OR rgb(...) — samplePalette/lerpColor return rgb(...)
 * for any interpolated stop) by a factor (1.0 = unchanged, 1.5 = 50% brighter).
 */
export function brightenHex(color: string, factor: number): string {
  const [r, g, b] = parseColor(color);
  return `rgb(${Math.min(255, Math.round(r * factor))},${Math.min(255, Math.round(g * factor))},${Math.min(255, Math.round(b * factor))})`;
}

// ─── Core Raster Engine ───────────────────────────────────────────────────────

/**
 * AsciiEngine uses a SCANLINE RASTER approach.
 *
 * Both u (col) and v (row) are mapped to [-1, 1]. Since we render characters
 * onto a square off-screen canvas (not a terminal), no aspect correction is needed.
 *
 * Supports per-character coloring via a `getColor` callback for multi-color palettes.
 */
export class AsciiEngine {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * Renders an ASCII body to a canvas context with per-character color.
   *
   * @param ctx       Canvas 2D context
   * @param fillChar  (col, row, u, v) → luminance [0..1] or -1 for empty
   * @param getColor  (luminance, u, v) → CSS color string
   */
  render(
    ctx: CanvasRenderingContext2D,
    fillChar: (col: number, row: number, u: number, v: number) => number,
    getColor: (lum: number, u: number, v: number) => string
  ) {
    const cw = ctx.canvas.width  / this.width;
    const ch = ctx.canvas.height / this.height;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = `bold ${Math.floor(ch * 1.05)}px "Roboto Mono", "Courier New", monospace`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const u = ((col + 0.5) / this.width  - 0.5) * 2;
        const v = ((row + 0.5) / this.height - 0.5) * 2;

        const lum = fillChar(col, row, u, v);
        if (lum < 0) continue;

        const idx = Math.max(0, Math.min(PALETTE_LEN - 1, Math.floor(lum * (PALETTE_LEN - 1))));
        const ch_char = CHAR_PALETTE[idx];
        if (ch_char === ' ') continue;

        ctx.fillStyle = getColor(lum, u, v);
        ctx.fillText(ch_char, col * cw, row * ch);
      }
    }
  }
}
