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
    color: "#ff3e5b",
    strokeColor: "#ff3e5b",
  },
  // First level nodes
  {
    id: "projects",
    label: "Projects",
    description: "Portfolio & Commercial Work",
    position: { x: 0, y: -200 },
    level: 1,
    angle: -Math.PI / 2,
    isActive: false,
    isHovered: false,
    connections: ["center", "1", "2"], // Fixed: "1" = Web Apps, "2" = Mobile
    color: "#36732e",
    strokeColor: "#36732e",
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
    connections: ["center", "5"], // Fixed: "5" = Education
    color: "#639bff",
    strokeColor: "#639bff",
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
    connections: ["center", "4", "3"], // Fixed: "4" = Frontend, "3" = Backend
    color: "#bd140b",
    strokeColor: "#bd140b",
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
    color: "#8f563b",
    strokeColor: "#8f563b",
  },
  // Second level nodes
  {
    id: "1",
    label: "Web Apps",
    description: "Full-stack applications",
    position: { x: -100, y: -300 },
    level: 2,
    angle: -2.356,
    isActive: false,
    isHovered: false,
    connections: ["projects"],
    color: "#696a6a",
    strokeColor: "#696a6a",
  },
  {
    id: "2",
    label: "Mobile",
    description: "iOS & Android apps",
    position: { x: 100, y: -300 },
    level: 2,
    angle: -0.785,
    isActive: false,
    isHovered: false,
    connections: ["projects"],
    color: "#75645d",
    strokeColor: "#75645d",
  },
  {
    id: "4",
    label: "Frontend",
    description: "React, Vue, Angular",
    position: { x: -100, y: 300 },
    level: 2,
    angle: 2.356,
    isActive: false,
    isHovered: false,
    connections: ["skills"],
    color: "#696a6a",
    strokeColor: "#696a6a",
  },
  {
    id: "3",
    label: "Backend",
    description: "Node.js, Python, Go",
    position: { x: 100, y: 300 },
    level: 2,
    angle: 0.785,
    isActive: false,
    isHovered: false,
    connections: ["skills"],
    color: "#75645d",
    strokeColor: "#ac3232",
  },
  {
    id: "5",
    label: "Education",
    description: "Academic background",
    position: { x: 300, y: -100 },
    level: 2,
    angle: -0.464,
    isActive: false,
    isHovered: false,
    connections: ["experience"],
    color: "#696a6a",
    strokeColor: "#696a6a",
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
