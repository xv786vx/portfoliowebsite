import { create } from "zustand";

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
}

interface SkillTreeState {
  nodes: SkillNode[];
  activeNodeId: string | null;
  hoveredNodeId: string | null;
  canvasSize: { width: number; height: number };
  setActiveNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  setCanvasSize: (size: { width: number; height: number }) => void;
  updateNodePosition: (
    nodeId: string,
    position: { x: number; y: number }
  ) => void;
}

// Sample node data for the portfolio
const initialNodes: SkillNode[] = [
  {
    id: "center",
    label: "Firas Adnan Jalil",
    description: "Aspiring Software Engineer",
    position: { x: 0, y: 0 },
    level: 0,
    isActive: true,
    isHovered: false,
    connections: ["projects", "experience", "skills", "contact"],
    color: "#295b9c",
    strokeColor: "#295b9c",
  },
  {
    id: "projects",
    label: "Projects",
    description: "Portfolio & Commercial Work",
    position: { x: 0, y: -200 },
    level: 1,
    angle: -Math.PI / 2,
    isActive: false,
    isHovered: false,
    connections: ["center", "web-projects", "mobile-projects"],
    color: "#3e844b",
    strokeColor: "#3e844b",
  },
  {
    id: "experience",
    label: "Experience",
    description: "5+ Years Development",
    position: { x: 200, y: 0 },
    level: 1,
    angle: 0,
    isActive: false,
    isHovered: false,
    connections: ["center", "education"],
    color: "#6c3ba4",
    strokeColor: "#6c3ba4",
  },
  {
    id: "skills",
    label: "Skills",
    description: "Languages & Frameworks",
    position: { x: 0, y: 200 },
    level: 1,
    angle: Math.PI / 2,
    isActive: false,
    isHovered: false,
    connections: ["center", "frontend", "backend"],
    color: "#b32428",
    strokeColor: "#b32428",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Get in touch",
    position: { x: -200, y: 0 },
    level: 1,
    angle: Math.PI,
    isActive: false,
    isHovered: false,
    connections: ["center"],
    color: "#d4af37",
    strokeColor: "#d4af37",
  },
  // Second level nodes
  {
    id: "web-projects",
    label: "Web Apps",
    description: "Full-stack applications",
    position: { x: -100, y: -300 },
    level: 2,
    angle: -2.356,
    isActive: false,
    isHovered: false,
    connections: ["projects"],
    color: "#2e9a8c",
    strokeColor: "#2e9a8c",
  },
  {
    id: "mobile-projects",
    label: "Mobile",
    description: "iOS & Android apps",
    position: { x: 100, y: -300 },
    level: 2,
    angle: -0.785,
    isActive: false,
    isHovered: false,
    connections: ["projects"],
    color: "#2e9a8c",
    strokeColor: "#2e9a8c",
  },
  {
    id: "frontend",
    label: "Frontend",
    description: "React, Vue, Angular",
    position: { x: -100, y: 300 },
    level: 2,
    angle: 2.356,
    isActive: false,
    isHovered: false,
    connections: ["skills"],
    color: "#d65a1f",
    strokeColor: "#d65a1f",
  },
  {
    id: "backend",
    label: "Backend",
    description: "Node.js, Python, Go",
    position: { x: 100, y: 300 },
    level: 2,
    angle: 0.785,
    isActive: false,
    isHovered: false,
    connections: ["skills"],
    color: "#d65a1f",
    strokeColor: "#d65a1f",
  },
  {
    id: "education",
    label: "Education",
    description: "Academic background",
    position: { x: 300, y: -100 },
    level: 2,
    angle: -0.464,
    isActive: false,
    isHovered: false,
    connections: ["experience"],
    color: "#c656a0",
    strokeColor: "#c656a0",
  },
];

export const useSkillTreeStore = create<SkillTreeState>((set) => ({
  nodes: initialNodes,
  activeNodeId: "center",
  hoveredNodeId: null,
  canvasSize: { width: 800, height: 600 },

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
}));
