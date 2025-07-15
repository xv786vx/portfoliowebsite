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
                (node.color || connectedNode.color || '#3b82f6') : '#4b5563',
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
          strokeWidth={connection.isActive ? 3 : 2}
          opacity={connection.isActive ? 0.8 : 0.4}
          lineCap="round"
          dash={connection.isActive ? undefined : [10, 5]}
          perfectDrawEnabled={false}
        />
      ))}
    </Group>
  );
};

export default ConnectionLines;
