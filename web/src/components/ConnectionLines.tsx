import React from 'react';
import { Line, Group } from 'react-konva';
import { useSkillTreeStore } from '../store/skillTreeStore';

interface ConnectionLinesProps {
  centerX: number;
  centerY: number;
  scale?: number;
}

const ConnectionLines: React.FC<ConnectionLinesProps> = ({ 
  centerX, 
  centerY, 
  scale = 1 
}) => {
  const { nodes } = useSkillTreeStore();
  
  const getConnections = () => {
    const connections: Array<{
      from: { x: number; y: number };
      to: { x: number; y: number };
      color: string;
      isActive: boolean;
    }> = [];
    
    nodes.forEach((node) => {
      node.connections.forEach((connectionId) => {
        const connectedNode = nodes.find(n => n.id === connectionId);
        if (connectedNode) {
          // Only draw each connection once (from lower level to higher level)
          if (node.level <= connectedNode.level) {
            connections.push({
              from: {
                x: centerX + node.position.x * scale,
                y: centerY + node.position.y * scale,
              },
              to: {
                x: centerX + connectedNode.position.x * scale,
                y: centerY + connectedNode.position.y * scale,
              },
              color: node.isActive || connectedNode.isActive ? 
                (node.strokeColor || connectedNode.strokeColor || '#ffffff') : '#666666',
              isActive: node.isActive || connectedNode.isActive,
            });
          }
        }
      });
    });
    
    return connections;
  };
  
  const connections = getConnections();
  
  return (
    <Group>
      {connections.map((connection, index) => (
        <Line
          key={index}
          points={[
            connection.from.x,
            connection.from.y,
            connection.to.x,
            connection.to.y,
          ]}
          stroke={connection.color}
          strokeWidth={connection.isActive ? 6 : 4} // 4px for inactive, 6px for active to maintain pixel aesthetic
          opacity={connection.isActive ? 0.9 : 0.5}
          lineCap="butt" // Sharp corners for pixel art
          lineJoin="miter" // Sharp joins
          dash={connection.isActive ? undefined : [8, 8]} // Pixel-sized dashes
          perfectDrawEnabled={false}
          shadowBlur={connection.isActive ? 4 : 0}
          shadowColor={connection.isActive ? connection.color : 'transparent'}
          shadowOpacity={0.3}
        />
      ))}
    </Group>
  );
};

export default ConnectionLines;
