import React, { useEffect, useMemo, useRef } from 'react';
import { Text, Group } from 'react-konva';
import type Konva from 'konva';
import { useSkillTreeStore } from '../store/skillTreeStore';
import { getConnectionPairs } from '../utils/connections';
import { hashStr } from '../utils/celestialBodies';
import { getConstellationPosition } from '../utils/constellationPosition';

interface ConstellationLinesProps {
  centerX: number;
  centerY: number;
  scale?: number;
}

// Small, twinkling ASCII marks for the connecting "wire" — sized like the
// fine character texture that shades the planets/asteroids (AsciiNodeBody's
// 28x28 grid), not big directional slash/pipe glyphs.
const WIRE_CHARS = ['.', ':', '*'];

// Waypoint "stars" are built from a few of these small marks arranged into a
// tiny sparkle cluster — same scale as the wire, never one big single glyph.
const STAR_CENTER_GLYPHS = ['*', '+', 'x'];
const STAR_PATTERNS: Array<{ dx: number; dy: number; ch: string }[]> = [
  [
    { dx: 0, dy: 0, ch: '' }, // center — glyph filled in per-star
    { dx: -1, dy: 0, ch: '.' },
    { dx: 1, dy: 0, ch: '.' },
    { dx: 0, dy: -1, ch: '.' },
    { dx: 0, dy: 1, ch: '.' },
  ],
  [
    { dx: 0, dy: 0, ch: '' },
    { dx: -1, dy: -1, ch: '.' },
    { dx: 1, dy: -1, ch: '.' },
    { dx: -1, dy: 1, ch: '.' },
    { dx: 1, dy: 1, ch: '.' },
  ],
];

interface WireMark {
  x: number;
  y: number;
  glyph: string;
  fontSize: number;
  phase: number;
}

interface StarChar {
  x: number;
  y: number;
  glyph: string;
  fontSize: number;
  isCenter: boolean;
  phase: number;
}

/** Evenly-spaced points along a segment (excluding the start, which the
 *  previous segment/node already occupies). */
function sampleSegment(p: { x: number; y: number }, q: { x: number; y: number }, spacing: number) {
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.max(1, Math.round(dist / spacing));
  const pts: { x: number; y: number }[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    pts.push({ x: p.x + dx * t, y: p.y + dy * t });
  }
  return pts;
}

const ConstellationLines: React.FC<ConstellationLinesProps> = ({
  centerX,
  centerY,
  scale = 1,
}) => {
  const { nodes } = useSkillTreeStore();

  // All of this is fully deterministic (seeded) per layout — compute it once
  // per actual layout change instead of on every animation frame.
  const { wireMarks, starChars } = useMemo(() => {
    const pairs = getConnectionPairs(nodes, centerX, centerY, scale, getConstellationPosition);
    const wireCharSize = Math.max(7, 9 * scale);
    const spacing = wireCharSize * 1.3; // denser than before — more pronounced wire
    const starCharSize = wireCharSize * 1.15;

    const wireMarks: WireMark[] = [];
    const starChars: StarChar[] = [];

    pairs.forEach((pair) => {
      const dx = pair.to.x - pair.from.x;
      const dy = pair.to.y - pair.from.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const perpX = -dy / dist;
      const perpY = dx / dist;

      // 1-3 waypoints depending on edge length, each stably jittered off the
      // straight line (seeded — never recomputed randomly per frame).
      const waypointCount = Math.max(1, Math.min(3, Math.round(dist / 160)));
      const points: { x: number; y: number }[] = [pair.from];
      for (let i = 1; i <= waypointCount; i++) {
        const t = i / (waypointCount + 1);
        const baseX = pair.from.x + dx * t;
        const baseY = pair.from.y + dy * t;
        const jitterSeed = hashStr(`${pair.id}-${i}`);
        const jitterAmount = (jitterSeed % 1000) / 1000 - 0.5; // -0.5..0.5
        const jitterPx = jitterAmount * Math.min(60, dist * 0.25);
        points.push({ x: baseX + perpX * jitterPx, y: baseY + perpY * jitterPx });
      }
      points.push(pair.to);

      // ASCII wire: small, twinkling marks — not big slashes/pipes
      points.slice(0, -1).forEach((p, i) => {
        const q = points[i + 1];
        sampleSegment(p, q, spacing).forEach((s, si) => {
          const charSeed = hashStr(`${pair.id}-seg-${i}-${si}`);
          wireMarks.push({
            x: s.x,
            y: s.y,
            glyph: WIRE_CHARS[charSeed % WIRE_CHARS.length],
            fontSize: wireCharSize,
            phase: (charSeed % 628) / 100,
          });
        });
      });

      // waypoint "stars" — small multi-character sparkle clusters, same scale
      // as the wire marks, not one big single glyph
      points.slice(1, -1).forEach((p, i) => {
        const starSeed = hashStr(`${pair.id}-star-${i}`);
        const centerGlyph = STAR_CENTER_GLYPHS[starSeed % STAR_CENTER_GLYPHS.length];
        const pattern = STAR_PATTERNS[Math.floor(starSeed / 7) % STAR_PATTERNS.length];
        const armGap = starCharSize * 0.9;
        const phase = (starSeed % 628) / 100;
        pattern.forEach((pt) => {
          const isCenter = pt.dx === 0 && pt.dy === 0;
          starChars.push({
            x: p.x + pt.dx * armGap,
            y: p.y + pt.dy * armGap,
            glyph: isCenter ? centerGlyph : pt.ch,
            fontSize: starCharSize,
            isCenter,
            phase,
          });
        });
      });
    });

    return { wireMarks, starChars };
  }, [nodes, centerX, centerY, scale]);

  const wireRefs = useRef<(Konva.Text | null)[]>([]);
  const starRefs = useRef<(Konva.Text | null)[]>([]);

  // Twinkle is driven entirely imperatively — precomputed geometry above never
  // changes per frame, so there's no React re-render involved in animating it.
  useEffect(() => {
    let raf = 0;
    let last = Date.now();
    let drawAcc = 0;

    const tick = () => {
      const now = Date.now();
      drawAcc += now - last;
      last = now;

      // Cap the actual redraw to ~30fps — twinkle doesn't need 60fps.
      if (drawAcc >= 1000 / 30) {
        drawAcc = 0;
        const t = now * 0.001;
        let layer: Konva.Layer | null = null;

        for (let i = 0; i < wireMarks.length; i++) {
          const node = wireRefs.current[i];
          if (!node) continue;
          const m = wireMarks[i];
          const twinkle = 0.5 + 0.5 * Math.sin(t * 3 + m.phase);
          const dim = 0.45 + twinkle * 0.45; // 0.45-0.9
          node.fill(`rgba(190,200,230,${dim.toFixed(2)})`);
          if (!layer) layer = node.getLayer();
        }

        for (let i = 0; i < starChars.length; i++) {
          const node = starRefs.current[i];
          if (!node) continue;
          const s = starChars[i];
          const twinkle = 0.55 + 0.45 * Math.sin(t * 2.2 + s.phase);
          const b = Math.floor((s.isCenter ? 215 : 150) + (s.isCenter ? 40 : 60) * twinkle);
          node.fill(`rgb(${b},${b},${Math.min(255, b + 15)})`);
          node.opacity(s.isCenter ? 0.8 + 0.2 * twinkle : 0.4 + 0.35 * twinkle);
          if (s.isCenter) node.shadowBlur(5 + 5 * twinkle);
          if (!layer) layer = node.getLayer();
        }

        layer?.batchDraw();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [wireMarks, starChars]);

  return (
    <Group listening={false}>
      {wireMarks.map((m, i) => (
        <Text
          key={i}
          ref={(node) => {
            wireRefs.current[i] = node;
          }}
          text={m.glyph}
          x={m.x}
          y={m.y}
          fontSize={m.fontSize}
          fontFamily='"Roboto Mono", monospace'
          fill="rgba(190,200,230,0.6)"
          offsetX={m.fontSize / 2}
          offsetY={m.fontSize / 2}
          listening={false}
        />
      ))}

      {starChars.map((s, i) => (
        <Text
          key={i}
          ref={(node) => {
            starRefs.current[i] = node;
          }}
          text={s.glyph}
          x={s.x}
          y={s.y}
          fontSize={s.fontSize}
          fontFamily='"Roboto Mono", monospace'
          fontStyle={s.isCenter ? 'bold' : 'normal'}
          fill={s.isCenter ? 'rgb(230,230,240)' : 'rgb(180,180,195)'}
          offsetX={s.fontSize / 2}
          offsetY={s.fontSize / 2}
          opacity={s.isCenter ? 0.9 : 0.55}
          shadowColor="#dfe8ff"
          shadowBlur={s.isCenter ? 6 : 0}
          shadowOpacity={0.5}
          listening={false}
        />
      ))}
    </Group>
  );
};

export default ConstellationLines;
