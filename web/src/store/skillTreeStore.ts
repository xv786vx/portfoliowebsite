import { create } from "zustand";
import portfolioData from "../data/portfolioData.json";
import type { PortfolioNodeData } from "../types/portfolioTypes";

export interface SkillNode {
  id: string;
  label: string;
  description?: string;
  position: { x: number; y: number };
  level: number; // 0 = center, 1 = first ring, etc.
  angle?: number; // angle in radians for positioning
  isActive: boolean;
  isHovered: boolean;
  connections: string[]; // IDs of connected nodes
  icon?: string;
  color?: string;
  strokeColor?: string; // Optional stroke color for the node
  portfolioData?: PortfolioNodeData; // Reference to detailed portfolio data
}

interface SkillTreeState {
  nodes: SkillNode[];
  activeNodeId: string | null;
  hoveredNodeId: string | null;
  canvasSize: { width: number; height: number };
  isDetailModalOpen: boolean;
  detailModalNodeId: string | null;
  uiMode: "orbital" | "static"; // Toggle between orbital rotation and static with lines
  setActiveNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  setCanvasSize: (size: { width: number; height: number }) => void;
  updateNodePosition: (
    nodeId: string,
    position: { x: number; y: number }
  ) => void;
  openDetailModal: (nodeId: string) => void;
  closeDetailModal: () => void;
  toggleUIMode: () => void;
}

// Sample node data for the portfolio
const initialNodes: SkillNode[] = [
  {
    id: "center",
    label: portfolioData.center.label,
    description: portfolioData.center.description,
    position: { x: 0, y: 0 },
    level: 0,
    isActive: true,
    isHovered: false,
    connections: ["projects", "experience", "skills", "contact"],
    color: "#ff3e5b",
    strokeColor: "#ff3e5b",
    portfolioData: portfolioData.center,
  },
  // First level nodes
  {
    id: "projects",
    label: portfolioData.projects.label,
    description: portfolioData.projects.description,
    position: { x: 0, y: -200 },
    level: 1,
    angle: -Math.PI / 2,
    isActive: false,
    isHovered: false,
    connections: [
      "center",
      "project_syncer",
      "project_f1",
      "project_lstm",
      "project_ss",
      "project_recipelens",
    ],
    color: "#36732e",
    strokeColor: "#36732e",
    portfolioData: portfolioData.projects,
  },
  {
    id: "experience",
    label: portfolioData.experience.label,
    description: portfolioData.experience.description,
    position: { x: 200, y: 0 },
    level: 1,
    angle: 0,
    isActive: false,
    isHovered: false,
    connections: [
      "center",
      "experience_vertige",
      "experience_owh",
      "skill_education",
    ], // Updated connections
    color: "#639bff",
    strokeColor: "#639bff",
    portfolioData: portfolioData.experience,
  },
  {
    id: "skills",
    label: portfolioData.skills.label,
    description: portfolioData.skills.description,
    position: { x: 0, y: 200 },
    level: 1,
    angle: Math.PI / 2,
    isActive: false,
    isHovered: false,
    connections: ["center"], // Updated connections - no child nodes for skills
    color: "#bd140b",
    strokeColor: "#bd140b",
    portfolioData: portfolioData.skills,
  },
  {
    id: "contact",
    label: portfolioData.contact.label,
    description: portfolioData.contact.description,
    position: { x: -200, y: 0 },
    level: 1,
    angle: Math.PI,
    isActive: false,
    isHovered: false,
    connections: ["center"],
    color: "#8f563b",
    strokeColor: "#8f563b",
    portfolioData: portfolioData.contact,
  },
  // Project nodes - evenly distributed on outer orbital (radius 350px) - 8 nodes total, 45° apart
  {
    id: "project_syncer",
    label: portfolioData.project_syncer.label,
    description: portfolioData.project_syncer.description,
    position: { x: 0, y: -350 }, // 0° (top)
    level: 2,
    angle: -Math.PI / 2, // -90 degrees
    isActive: false,
    isHovered: false,
    connections: ["projects"],
    color: "#696a6a",
    strokeColor: "#696a6a",
    portfolioData: portfolioData.project_syncer,
  },
  {
    id: "project_f1",
    label: portfolioData.project_f1.label,
    description: portfolioData.project_f1.description,
    position: { x: 247, y: -247 }, // 45° clockwise from top
    level: 2,
    angle: -0.785, // -45 degrees
    isActive: false,
    isHovered: false,
    connections: ["projects"],
    color: "#75645d",
    strokeColor: "#75645d",
    portfolioData: portfolioData.project_f1,
  },
  {
    id: "project_lstm",
    label: portfolioData.project_lstm.label,
    description: portfolioData.project_lstm.description,
    position: { x: 350, y: 0 }, // 90° clockwise from top (right side)
    level: 2,
    angle: 0, // 0 degrees
    isActive: false,
    isHovered: false,
    connections: ["projects"],
    color: "#75645d",
    strokeColor: "#75645d",
    portfolioData: portfolioData.project_lstm,
  },
  {
    id: "project_ss",
    label: portfolioData.project_ss.label,
    description: portfolioData.project_ss.description,
    position: { x: 247, y: 247 }, // 135° clockwise from top
    level: 2,
    angle: 0.785, // 45 degrees
    isActive: false,
    isHovered: false,
    connections: ["projects"],
    color: "#75645d",
    strokeColor: "#75645d",
    portfolioData: portfolioData.project_ss,
  },
  {
    id: "project_recipelens",
    label: portfolioData.project_recipelens.label,
    description: portfolioData.project_recipelens.description,
    position: { x: 0, y: 350 }, // 180° clockwise from top (bottom)
    level: 2,
    angle: 1.571, // 90 degrees
    isActive: false,
    isHovered: false,
    connections: ["projects"],
    color: "#696a6a",
    strokeColor: "#696a6a",
    portfolioData: portfolioData.project_recipelens,
  },
  // Experience nodes - positioned on outer orbital (radius 350px from center) with better spacing
  {
    id: "experience_vertige",
    label: portfolioData.experience_vertige.label,
    description: portfolioData.experience_vertige.description,
    position: { x: -247, y: 247 }, // 225° clockwise from top
    level: 2,
    angle: 2.356, // 135 degrees
    isActive: false,
    isHovered: false,
    connections: ["experience"],
    color: "#75645d",
    strokeColor: "#75645d",
    portfolioData: portfolioData.experience_vertige,
  },
  {
    id: "experience_owh",
    label: portfolioData.experience_owh.label,
    description: portfolioData.experience_owh.description,
    position: { x: -350, y: 0 }, // 270° clockwise from top (left side)
    level: 2,
    angle: 3.142, // 180 degrees
    isActive: false,
    isHovered: false,
    connections: ["experience"],
    color: "#696a6a",
    strokeColor: "#696a6a",
    portfolioData: portfolioData.experience_owh,
  },
  {
    id: "skill_education",
    label: portfolioData.skill_education.label,
    description: portfolioData.skill_education.description,
    position: { x: -247, y: -247 }, // 315° clockwise from top
    level: 2,
    angle: -2.356, // -135 degrees
    isActive: false,
    isHovered: false,
    connections: ["experience"],
    color: "#696a6a",
    strokeColor: "#696a6a",
    portfolioData: portfolioData.skill_education,
  },
];

export const useSkillTreeStore = create<SkillTreeState>((set) => ({
  nodes: initialNodes,
  activeNodeId: "center",
  hoveredNodeId: null,
  canvasSize: { width: 800, height: 600 },
  isDetailModalOpen: false,
  detailModalNodeId: null,
  uiMode: "orbital", // Default to orbital mode

  setActiveNode: (nodeId) =>
    set((state) => ({
      activeNodeId: nodeId,
      nodes: state.nodes.map((node) => ({
        ...node,
        isActive: node.id === nodeId,
      })),
    })),

  setHoveredNode: (nodeId) =>
    set((state) => ({
      hoveredNodeId: nodeId,
      nodes: state.nodes.map((node) => ({
        ...node,
        isHovered: node.id === nodeId,
      })),
    })),

  setCanvasSize: (size) => set({ canvasSize: size }),

  updateNodePosition: (nodeId, position) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, position } : node
      ),
    })),

  openDetailModal: (nodeId) =>
    set({
      isDetailModalOpen: true,
      detailModalNodeId: nodeId,
    }),

  closeDetailModal: () =>
    set({
      isDetailModalOpen: false,
      detailModalNodeId: null,
    }),

  toggleUIMode: () =>
    set((state) => ({
      uiMode: state.uiMode === "orbital" ? "static" : "orbital",
    })),
}));
