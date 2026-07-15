import type { SkillNode } from "../store/skillTreeStore";

// Fixed top-to-bottom order for the locked mobile layout. Parents are followed
// immediately by their subnodes so the connecting lines read as a downward flow.
export const MOBILE_ORDER = [
  "center", // Firas Adnan Jalil
  "contact",
  "experience",
  "experience_vertige",
  "experience_owh",
  "skill_education",
  "projects",
  "project_syncer",
  "project_lstm",
  "project_ss",
  "project_recipelens",
];

// Horizontal offset factor per subnode (× OFFSET_UNIT). Level-2 nodes alternate
// left/right of center so their line to the parent fans out as a diagonal.
const MOBILE_X_OFFSET: Record<string, number> = {
  experience_vertige: -1,
  experience_owh: 1,
  skill_education: -1,
  project_syncer: 1,
  project_lstm: -1,
  project_ss: 1,
  project_recipelens: -1,
};

// Unscaled base metrics (multiplied by `scale` at call time).
const ROW_SPACING = 300; // vertical gap between successive nodes
const OFFSET_UNIT = 72; // horizontal displacement for offset subnodes
const TOP_PADDING = 0.7; // × row spacing, space above the first node

export const getMobileRowSpacing = (scale: number) => ROW_SPACING * scale;
export const getMobileContentTop = (scale: number) =>
  getMobileRowSpacing(scale) * TOP_PADDING;

/** Total canvas height needed to stack every node with padding top and bottom. */
export const getMobileContentHeight = (scale: number) =>
  getMobileContentTop(scale) + MOBILE_ORDER.length * getMobileRowSpacing(scale);

/**
 * Locked mobile layout: nodes stacked vertically in MOBILE_ORDER. `contentTop`
 * is passed via the shared position-fn's `centerY` slot so this stays
 * compatible with getConnectionPairs.
 */
export const getMobilePosition = (
  node: SkillNode,
  centerX: number,
  contentTop: number,
  scale: number
) => {
  const idx = MOBILE_ORDER.indexOf(node.id);
  const rowSpacing = ROW_SPACING * scale;
  const y = contentTop + (idx < 0 ? 0 : idx) * rowSpacing;
  const offsetFactor = MOBILE_X_OFFSET[node.id] ?? 0;
  const x = centerX + offsetFactor * OFFSET_UNIT * scale;
  return { x, y };
};
