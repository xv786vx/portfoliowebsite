import type { SkillNode } from "../store/skillTreeStore";

export const getStaticPosition = (
  node: SkillNode,
  centerX: number,
  centerY: number,
  scale: number
) => {
  // For static mode, we'll use a more organized layout

  if (node.level === 0) {
    // Center node stays at center
    return { x: centerX, y: centerY };
  }

  if (node.level === 1) {
    // Category nodes: positioned in cardinal directions around center
    const baseRadius = 250 * scale;

    switch (node.id) {
      case "projects":
        return { x: centerX, y: centerY - baseRadius }; // Top
      case "experience":
        return { x: centerX + baseRadius, y: centerY }; // Right
      case "skills":
        return { x: centerX, y: centerY + baseRadius }; // Bottom
      case "contact":
        return { x: centerX - baseRadius, y: centerY }; // Left
      default:
        return {
          x: centerX + node.position.x * scale,
          y: centerY + node.position.y * scale,
        };
    }
  }

  if (node.level === 2) {
    // Child nodes: positioned in organized clusters around their parent category
    const parentRadius = 250 * scale;
    const childRadius = 180 * scale;

    // Group nodes by their parent category
    if (node.connections.includes("projects")) {
      // Project nodes arranged in a semi-circle above the projects node
      const projectNodes = [
        "project_syncer",
        "project_f1",
        "project_lstm",
        "project_ss",
        "project_recipelens",
      ];
      const nodeIndex = projectNodes.indexOf(node.id);
      const totalNodes = projectNodes.length;

      if (nodeIndex !== -1) {
        // Arrange in an arc above the projects category node
        const angleSpread = Math.PI; // 180 degrees
        const startAngle = -angleSpread / 2; // Start from left
        const angle = startAngle + (nodeIndex / (totalNodes - 1)) * angleSpread;

        return {
          x: centerX + Math.cos(angle - Math.PI / 2) * childRadius,
          y:
            centerY -
            parentRadius +
            Math.sin(angle - Math.PI / 2) * childRadius,
        };
      }
    }

    if (node.connections.includes("experience")) {
      // Experience nodes arranged in a semi-circle to the right of experience node
      const experienceNodes = [
        "experience_vertige",
        "experience_owh",
        "skill_education",
      ];
      const nodeIndex = experienceNodes.indexOf(node.id);
      const totalNodes = experienceNodes.length;

      if (nodeIndex !== -1) {
        // Arrange in an arc to the right of the experience category node
        const startAngle = -Math.PI / 4; // Start from top-right
        const angle =
          startAngle +
          (nodeIndex / Math.max(1, totalNodes - 1)) * (Math.PI / 2); // 90 degree spread

        return {
          x: centerX + parentRadius + Math.cos(angle) * childRadius,
          y: centerY + Math.sin(angle) * childRadius,
        };
      }
    }
  }

  // Fallback to original position
  return {
    x: centerX + node.position.x * scale,
    y: centerY + node.position.y * scale,
  };
};
