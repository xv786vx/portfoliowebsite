import type { SkillNode } from "../store/skillTreeStore";

// Hand-placed polar coordinates (angle in degrees, radius factor) per node —
// deliberately IRREGULAR (not evenly spaced, unlike the cardinal/arc static
// layout) but chosen so the four quadrants — and specifically the left/right
// halves of the screen around the fixed, centered black hole — stay roughly
// balanced. angle 0deg = +x (right), 90deg = +y (down), increasing clockwise.
const LAYOUT: Record<string, { angle: number; radius: number }> = {
  // Level 1 — categories. One per quadrant, irregular spacing (not 90 apart).
  projects: { angle: 205, radius: 235 }, // upper-left
  contact: { angle: 150, radius: 250 }, // lower-left
  experience: { angle: 35, radius: 245 }, // lower-right
  skills: { angle: 325, radius: 215 }, // upper-right

  // Level 2 — projects' children, scattered loosely around projects' angle.
  project_syncer: { angle: 165, radius: 400 },
  project_lstm: { angle: 230, radius: 430 },
  project_ss: { angle: 195, radius: 460 },
  project_recipelens: { angle: 260, radius: 395 },

  // Level 2 — experience's children, scattered loosely around experience's angle.
  experience_vertige: { angle: 10, radius: 410 },
  experience_owh: { angle: 70, radius: 440 },
  skill_education: { angle: 45, radius: 390 },
};

/**
 * Constellation-mode layout: the black hole always anchors screen center;
 * every other node sits at a hand-placed (irregular, but left/right-balanced)
 * polar position around it — a fixed "star chart" rather than a clean grid.
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
    // Defensive fallback — shouldn't hit given the fixed node set above.
    return { x: centerX + node.position.x * scale, y: centerY + node.position.y * scale };
  }

  const rad = (entry.angle * Math.PI) / 180;
  const r = entry.radius * scale;
  return {
    x: centerX + Math.cos(rad) * r,
    y: centerY + Math.sin(rad) * r,
  };
};
