import React, { useMemo } from 'react';
import { Text } from 'react-konva';
import { useSkillTreeStore } from '../store/skillTreeStore';
import { getConnectionPairs } from '../utils/connections';
import { getMobilePosition } from '../utils/mobilePosition';
import { hashStr } from '../utils/celestialBodies';

interface MobileLinesProps {
  centerX: number;
  contentTop: number;
  scale?: number;
}

// Small ASCII marks for the connecting wire — same fine texture as the
// constellation lines, not solid strokes.
const WIRE_CHARS = ['.', ':', '+', '*'];

interface WireMark {
  x: number;
  y: number;
  glyph: string;
  fontSize: number;
}

/** ASCII connecting wires for the locked vertical mobile layout. Parent →
 *  subnode edges come straight out of the node `connections` graph. */
const MobileLines: React.FC<MobileLinesProps> = ({ centerX, contentTop, scale = 1 }) => {
  const { nodes } = useSkillTreeStore();

  const marks = useMemo(() => {
    const pairs = getConnectionPairs(nodes, centerX, contentTop, scale, getMobilePosition);
    const fontSize = Math.max(9, 12 * scale);
    const spacing = fontSize * 1.4;
    const out: WireMark[] = [];

    pairs.forEach((pair) => {
      const dx = pair.to.x - pair.from.x;
      const dy = pair.to.y - pair.from.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const steps = Math.max(1, Math.round(dist / spacing));
      // Skip the endpoints (i=1..steps-1) so glyphs don't sit under the bodies.
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const seed = hashStr(`${pair.id}-${i}`);
        out.push({
          x: pair.from.x + dx * t,
          y: pair.from.y + dy * t,
          glyph: WIRE_CHARS[seed % WIRE_CHARS.length],
          fontSize,
        });
      }
    });

    return out;
  }, [nodes, centerX, contentTop, scale]);

  return (
    <>
      {marks.map((m, i) => (
        <Text
          key={i}
          text={m.glyph}
          x={m.x}
          y={m.y}
          fontSize={m.fontSize}
          fontFamily='"Roboto Mono", monospace'
          fill="rgba(190,200,230,0.5)"
          offsetX={m.fontSize / 2}
          offsetY={m.fontSize / 2}
          listening={false}
        />
      ))}
    </>
  );
};

export default MobileLines;
