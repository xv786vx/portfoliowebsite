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
    label: "Your Name",
    description: "Full Stack Developer",
    position: { x: 0, y: 0 },
    level: 0,
    isActive: true,
    isHovered: false,
    connections: ["projects", "experience", "skills", "contact"],
    color: "#3b82f6",
    strokeColor: "#3b82f6",
  },
  {
    id: "projects",
    label: "My Projects",
    description: "Portfolio & Commercial Work",
    position: { x: 0, y: -150 },
    level: 1,
    angle: -Math.PI / 2,
    isActive: false,
    isHovered: false,
    connections: ["center", "web-projects", "mobile-projects"],
    color: "#10b981",
    strokeColor: "#10b981",
  },
  {
    id: "experience",
    label: "Work History",
    description: "5+ Years Development",
    position: { x: 150, y: 0 },
    level: 1,
    angle: 0,
    isActive: false,
    isHovered: false,
    connections: ["center", "education"],
    color: "#f59e0b",
    strokeColor: "#f59e0b",
  },
  {
    id: "skills",
    label: "Tech Stack",
    description: "Languages & Frameworks",
    position: { x: 0, y: 150 },
    level: 1,
    angle: Math.PI / 2,
    isActive: false,
    isHovered: false,
    connections: ["center", "frontend", "backend"],
    color: "#ef4444",
    strokeColor: "#ef4444",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Get in touch",
    position: { x: -150, y: 0 },
    level: 1,
    angle: Math.PI,
    isActive: false,
    isHovered: false,
    connections: ["center"],
    color: "#8b5cf6",
    strokeColor: "#8b5cf6",
  },
  // Second level nodes
  {
    id: "web-projects",
    label: "Web Apps",
    description: "Full-stack applications",
    position: { x: -100, y: -250 },
    level: 2,
    angle: -2.356,
    isActive: false,
    isHovered: false,
    connections: ["projects"],
    color: "#06b6d4",
    strokeColor: "#06b6d4",
  },
  {
    id: "mobile-projects",
    label: "Mobile",
    description: "iOS & Android apps",
    position: { x: 100, y: -250 },
    level: 2,
    angle: -0.785,
    isActive: false,
    isHovered: false,
    connections: ["projects"],
    color: "#06b6d4",
    strokeColor: "#06b6d4",
  },
  {
    id: "frontend",
    label: "Frontend",
    description: "React, Vue, Angular",
    position: { x: -100, y: 250 },
    level: 2,
    angle: 2.356,
    isActive: false,
    isHovered: false,
    connections: ["skills"],
    color: "#f97316",
    strokeColor: "#f97316",
  },
  {
    id: "backend",
    label: "Backend",
    description: "Node.js, Python, Go",
    position: { x: 100, y: 250 },
    level: 2,
    angle: 0.785,
    isActive: false,
    isHovered: false,
    connections: ["skills"],
    color: "#f97316",
    strokeColor: "#f97316",
  },
  {
    id: "education",
    label: "Education",
    description: "Academic background",
    position: { x: 250, y: -100 },
    level: 2,
    angle: -0.464,
    isActive: false,
    isHovered: false,
    connections: ["experience"],
    color: "#eab308",
    strokeColor: "#eab308",
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
