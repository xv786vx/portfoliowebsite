import { create } from "zustand";
import portfolioData from "../data/portfolioData.json";
import type { PortfolioNodeData } from "../types/portfolioTypes";

// The layout is locked to one mode per form factor: the constellation star
// chart on desktop, a vertical stack on mobile. SkillTree picks between them.
export type UIMode = "new" | "mobile";

export interface SkillNode {
  id: string;
  label: string;
  level: number; // 0 = center, 1 = first ring, etc. Drives body size + shape.
  isActive: boolean;
  isHovered: boolean;
  connections: string[]; // IDs of connected nodes
  portfolioData?: PortfolioNodeData; // Reference to detailed portfolio data
}

interface SkillTreeState {
  nodes: SkillNode[];
  activeNodeId: string | null;
  hoveredNodeId: string | null;
  focusedNodeId: string | null; // The node the camera is zoomed into (null = universe view)
  uiMode: UIMode;
  setHoveredNode: (nodeId: string | null) => void;
  focusNode: (nodeId: string) => void;
  clearFocus: () => void;
  setUIMode: (mode: UIMode) => void;
}

// The node set. Screen positions are NOT stored here — they live in
// `utils/constellationPosition.ts` (desktop) and `utils/mobilePosition.ts`
// (mobile), keyed by id. Adding a node here means adding an entry to both.
const initialNodes: SkillNode[] = [
  {
    id: "center",
    label: portfolioData.center.label,
    level: 0,
    isActive: true,
    isHovered: false,
    connections: ["projects", "experience", "contact"],
    portfolioData: portfolioData.center,
  },
  // First level nodes
  {
    id: "projects",
    label: portfolioData.projects.label,
    level: 1,
    isActive: false,
    isHovered: false,
    connections: [
      "center",
      "project_syncer",
      // "project_f1",
      "project_lstm",
      "project_ss",
      "project_recipelens",
    ],
    portfolioData: portfolioData.projects,
  },
  {
    id: "experience",
    label: portfolioData.experience.label,
    level: 1,
    isActive: false,
    isHovered: false,
    connections: [
      "center",
      "experience_vertige",
      "experience_owh",
      "skill_education",
    ],
    portfolioData: portfolioData.experience,
  },
  {
    id: "contact",
    label: portfolioData.contact.label,
    level: 1,
    isActive: false,
    isHovered: false,
    connections: ["center"],
    portfolioData: portfolioData.contact,
  },
  // Project nodes
  {
    id: "project_syncer",
    label: portfolioData.project_syncer.label,
    level: 2,
    isActive: false,
    isHovered: false,
    connections: ["projects"],
    portfolioData: portfolioData.project_syncer,
  },
  // Disabled. To re-enable, also add a `project_f1` entry to the LAYOUT map in
  // utils/constellationPosition.ts and to MOBILE_ORDER in utils/mobilePosition.ts,
  // and uncomment it from the `projects` connections above.
  // {
  //   id: "project_f1",
  //   label: portfolioData.project_f1.label,
  //   level: 2,
  //   isActive: false,
  //   isHovered: false,
  //   connections: ["projects"],
  //   portfolioData: portfolioData.project_f1,
  // },
  {
    id: "project_lstm",
    label: portfolioData.project_lstm.label,
    level: 2,
    isActive: false,
    isHovered: false,
    connections: ["projects"],
    portfolioData: portfolioData.project_lstm,
  },
  {
    id: "project_ss",
    label: portfolioData.project_ss.label,
    level: 2,
    isActive: false,
    isHovered: false,
    connections: ["projects"],
    portfolioData: portfolioData.project_ss,
  },
  {
    id: "project_recipelens",
    label: portfolioData.project_recipelens.label,
    level: 2,
    isActive: false,
    isHovered: false,
    connections: ["projects"],
    portfolioData: portfolioData.project_recipelens,
  },
  // Experience nodes
  {
    id: "experience_vertige",
    label: portfolioData.experience_vertige.label,
    level: 2,
    isActive: false,
    isHovered: false,
    connections: ["experience"],
    portfolioData: portfolioData.experience_vertige,
  },
  {
    id: "experience_owh",
    label: portfolioData.experience_owh.label,
    level: 2,
    isActive: false,
    isHovered: false,
    connections: ["experience"],
    portfolioData: portfolioData.experience_owh,
  },
  {
    id: "skill_education",
    label: portfolioData.skill_education.label,
    level: 2,
    isActive: false,
    isHovered: false,
    connections: ["experience"],
    portfolioData: portfolioData.skill_education,
  },
];

export const useSkillTreeStore = create<SkillTreeState>((set) => ({
  nodes: initialNodes,
  activeNodeId: "center",
  hoveredNodeId: null,
  focusedNodeId: null,
  uiMode: "new", // Default to the constellation mode; SkillTree switches on mobile.

  setHoveredNode: (nodeId) =>
    set((state) => ({
      hoveredNodeId: nodeId,
      nodes: state.nodes.map((node) => ({
        ...node,
        isHovered: node.id === nodeId,
      })),
    })),

  focusNode: (nodeId) =>
    set((state) => ({
      focusedNodeId: nodeId,
      activeNodeId: nodeId,
      nodes: state.nodes.map((node) => ({
        ...node,
        isActive: node.id === nodeId,
      })),
    })),

  clearFocus: () => set({ focusedNodeId: null }),

  setUIMode: (mode) => set({ uiMode: mode }),
}));
