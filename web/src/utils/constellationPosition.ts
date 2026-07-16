import type { SkillNode } from "../store/skillTreeStore";

// Hand-placed offsets (unscaled px from the centered black hole) per node —
// deliberately IRREGULAR (not evenly spaced, unlike the cardinal/arc static
// layout), but composed as a WIDE, SHALLOW band: the chart runs roughly 3x as
// far horizontally as it does vertically, so it suits landscape viewports
// instead of fighting them. +x is right, +y is DOWN (screen coords).
//
// Two rules hold the composition together:
//   - Each branch fans OUTWARD from center along its own side — projects and
//     its children to the left, experience and its children to the right — so
//     |x| grows with depth and the connection lines read as arms, not a tangle.
//     contact is childless, so it rides the right arm to keep the halves even.
//   - y values stay small and varied. They carry the constellation's scatter;
//     x carries the reach.
const LAYOUT: Record<string, { x: number; y: number }> = {
  // Left arm — projects (level 1) and its four children.
  projects: { x: -255, y: -25 },
  project_recipelens: { x: -300, y: 150 },
  project_ss: { x: -455, y: -140 },
  project_syncer: { x: -505, y: 45 },
  project_lstm: { x: -630, y: -55 },

  // Right arm — experience (level 1), its three children, and contact.
  contact: { x: 215, y: -175 },
  experience: { x: 265, y: 55 },
  skill_education: { x: 430, y: -95 },
  experience_vertige: { x: 490, y: 120 },
  experience_owh: { x: 640, y: -20 },
};

/**
 * Largest horizontal/vertical distance (in unscaled px, at scale 1) any node
 * center sits from the screen center. Used to pick a scale that fits the whole
 * constellation on screen regardless of viewport size.
 */
export function getConstellationExtent() {
  let maxX = 0;
  let maxY = 0;
  for (const { x, y } of Object.values(LAYOUT)) {
    maxX = Math.max(maxX, Math.abs(x));
    maxY = Math.max(maxY, Math.abs(y));
  }
  return { maxX, maxY };
}

/**
 * Constellation-mode layout: the black hole always anchors screen center;
 * every other node sits at a hand-placed (irregular, but left/right-balanced)
 * offset around it — a fixed "star chart" rather than a clean grid.
 */
export const getConstellationPosition = (
  node: SkillNode,
  centerX: number,
  centerY: number,
  scale: number
) => {
  if (node.level === 0) {
    return { x: centerX, y: centerY };
  }

  const entry = LAYOUT[node.id];
  if (!entry) {
    // A node in the store with no entry here has nowhere to go — park it on the
    // center so the omission is obvious rather than silently off-screen.
    return { x: centerX, y: centerY };
  }

  return {
    x: centerX + entry.x * scale,
    y: centerY + entry.y * scale,
  };
};
