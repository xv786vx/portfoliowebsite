import type Konva from 'konva';

/**
 * A single shared animation driver for all ASCII node bodies.
 *
 * Previously every AsciiNodeBody ran its own requestAnimationFrame loop with an
 * independent 30fps redraw accumulator. Because those accumulators were not
 * synchronized, on almost every frame at least one node crossed its threshold
 * and called `layer.batchDraw()` — so the Konva layer (which re-composites all
 * node images AND every static label Text) ended up drawing at ~60fps even
 * though each individual body only re-rasterizes at 30fps.
 *
 * This scheduler replaces the N loops with ONE:
 *  - every frame it integrates each node's phase (cheap, keeps motion smooth),
 *  - a single shared 30fps gate decides when bodies re-rasterize their canvas,
 *  - and it issues at most ONE batchDraw per dirtied layer per redraw tick.
 *
 * Net effect: the layer composites at a steady 30fps instead of ~60, and all
 * bodies redraw on the same tick.
 */

/** Per-node callback. `dt` is seconds since last frame; `draw` is true only on
 *  the shared 30fps redraw tick. Integrate phase every call; re-rasterize the
 *  canvas (and call {@link markLayerDirty}) only when `draw` is true. */
type AsciiTicker = (dt: number, draw: boolean) => void;

const DRAW_INTERVAL_MS = 1000 / 30; // shared redraw cadence for every body

const tickers = new Set<AsciiTicker>();
const dirtyLayers = new Set<Konva.Layer>();
let rafId = 0;
let lastFrame = 0;
let drawAcc = 0;

function frame() {
  const now = Date.now();
  // Clamp dt so a backgrounded/throttled tab doesn't produce one huge phase jump.
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;

  drawAcc += dt * 1000;
  const draw = drawAcc >= DRAW_INTERVAL_MS;
  if (draw) drawAcc = 0;

  tickers.forEach((t) => t(dt, draw));

  // One batched redraw per dirtied layer, per redraw tick.
  if (dirtyLayers.size) {
    dirtyLayers.forEach((layer) => layer.batchDraw());
    dirtyLayers.clear();
  }

  rafId = requestAnimationFrame(frame);
}

/** Register a per-node ticker. Returns an unsubscribe function; the shared rAF
 *  loop starts on the first registration and stops when the last one leaves. */
export function registerAsciiTicker(ticker: AsciiTicker): () => void {
  tickers.add(ticker);
  if (!rafId) {
    lastFrame = Date.now();
    drawAcc = DRAW_INTERVAL_MS; // draw on the very first frame
    rafId = requestAnimationFrame(frame);
  }
  return () => {
    tickers.delete(ticker);
    if (tickers.size === 0 && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };
}

/** Mark a layer as needing a redraw this tick; it is batched exactly once. */
export function markLayerDirty(layer: Konva.Layer | null | undefined): void {
  if (layer) dirtyLayers.add(layer);
}
