import type { SkillNode } from "../store/skillTreeStore";

export const getOrbitalPosition = (
  node: SkillNode,
  centerX: number,
  centerY: number,
  scale: number,
  animationTime: number
) => {
  if (node.level === 0) {
    // Center node stays fixed
    return { x: centerX, y: centerY };
  }

  if (node.level === 1) {
    // Category nodes: clockwise orbital motion (slowed down by 2/3s)
    const baseRadius = 200 * scale;
    const baseAngle = node.angle || 0;
    const currentAngle = baseAngle + animationTime * 0.00005; // Even slower clockwise

    return {
      x: centerX + Math.cos(currentAngle) * baseRadius,
      y: centerY + Math.sin(currentAngle) * baseRadius,
    };
  }

  if (node.level === 2) {
    // Child nodes: counterclockwise orbital motion (slowed down by 2/3s)
    const baseRadius =
      Math.sqrt(node.position.x ** 2 + node.position.y ** 2) * scale;
    const baseAngle = Math.atan2(node.position.y, node.position.x);
    const currentAngle = baseAngle - animationTime * 0.000085; // Even slower counterclockwise

    return {
      x: centerX + Math.cos(currentAngle) * baseRadius,
      y: centerY + Math.sin(currentAngle) * baseRadius,
    };
  }

  // Fallback to original position
  return {
    x: centerX + node.position.x * scale,
    y: centerY + node.position.y * scale,
  };
};
