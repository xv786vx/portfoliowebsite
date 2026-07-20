import type { SkillNode } from '../store/skillTreeStore';

export interface ConnectionPair {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

type PositionFn = (
  node: SkillNode,
  centerX: number,
  centerY: number,
  scale: number
) => { x: number; y: number };

/**
 * Pairs of connected nodes positioned via the given layout function, one
 * entry per edge — mirrors the pairing ConnectionLines.tsx builds internally
 * (each edge kept once, from the lower-level node to the higher-level one).
 */
export function getConnectionPairs(
  nodes: SkillNode[],
  centerX: number,
  centerY: number,
  scale: number,
  positionFn: PositionFn
): ConnectionPair[] {
  const pairs: ConnectionPair[] = [];

  nodes.forEach((node) => {
    node.connections.forEach((connectionId) => {
      const connectedNode = nodes.find((n) => n.id === connectionId);
      if (!connectedNode) return;
      if (node.level > connectedNode.level) return;

      pairs.push({
        id: `${node.id}->${connectedNode.id}`,
        from: positionFn(node, centerX, centerY, scale),
        to: positionFn(connectedNode, centerX, centerY, scale),
      });
    });
  });

  return pairs;
}
