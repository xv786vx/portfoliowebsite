import type { SkillNode } from "../store/skillTreeStore";

// Hand-placed offsets (unscaled px from the centered black hole) per node —
// deliberately IRREGULAR (not evenly spaced, unlike the cardinal/arc static
// layout), composed as a balanced fan that leans only moderately wider than it
// is tall (~2.25:1). It fills a landscape viewport without stretching edge to
// edge. +x is right, +y is DOWN (screen coords).
//
// Two rules hold the composition together:
//   - Each branch fans OUTWARD from center along its own side — projects and
//     its children to the left, experience and its children to the right — so
//     |x| grows with depth and the connection lines read as arms, not a tangle.
//     contact is childless, so it rides the right arm to keep the halves even.
//   - Children spread across a real vertical range (not just x), so each arm
//     opens into height rather than reaching further sideways.
const LAYOUT: Record<string, { x: number; y: number }> = {
  // Left arm — projects (level 1) and its six children.
  projects: { x: -230, y: -10 },
  project_honck: { x: -560, y: -180 },
  project_ss: { x: -300, y: -190 },
  project_syncer: { x: -470, y: -60 },
  project_lstm: { x: -390, y: 75 },
  project_recipelens: { x: -540, y: 175 },
  project_toygfs: { x: -300, y: 240 },

  // Right arm — experience (level 1), its three children, and contact.
  contact: { x: 180, y: -200 },
  experience: { x: 240, y: 20 },
  experience_owh: { x: 430, y: -120 },
  experience_vertige: { x: 500, y: 70 },
  experience_agency: { x: 360, y: 205 },

  // Education hangs directly off the black hole (center), so it sits on its own
  // as a clean vertical drop below center rather than in the experience cluster.
  skill_education: { x: 40, y: 285 },
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
