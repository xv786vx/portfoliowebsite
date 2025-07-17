import React from 'react';
import { Circle, Group } from 'react-konva';
import { useSkillTreeStore } from '../store/skillTreeStore';

interface OrbitalCirclesProps {
  centerX: number;
  centerY: number;
  scale?: number;
}

const OrbitalCircles: React.FC<OrbitalCirclesProps> = ({ 
  centerX, 
  centerY, 
  scale = 1 
}) => {
  const { nodes } = useSkillTreeStore();
  
  // Calculate orbital radii based on actual node positions
  const getOrbitalRadii = () => {
    const level1Nodes = nodes.filter(node => node.level === 1);
    const level2Nodes = nodes.filter(node => node.level === 2);
    
    // For level 1 (category nodes), calculate distance from center
    let level1Radius = 0;
    if (level1Nodes.length > 0) {
      const distances = level1Nodes.map(node => 
        Math.sqrt(node.position.x ** 2 + node.position.y ** 2)
      );
      level1Radius = Math.max(...distances) * scale;
    }
    
    // For level 2 (child nodes), calculate distance from center  
    let level2Radius = 0;
    if (level2Nodes.length > 0) {
      const distances = level2Nodes.map(node => 
        Math.sqrt(node.position.x ** 2 + node.position.y ** 2)
      );
      level2Radius = Math.max(...distances) * scale;
    }
    
    return { level1Radius, level2Radius };
  };
  
  const { level1Radius, level2Radius } = getOrbitalRadii();
  
  return (
    <Group>
      {/* Orbital circle for category nodes (level 1) */}
      {level1Radius > 0 && (
        <Circle
          x={centerX}
          y={centerY}
          radius={level1Radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.7)" // Subtle white
          strokeWidth={4}
          dash={[16, 16]} // Pixel-art style dashes
          lineCap="butt"
          perfectDrawEnabled={false}
          listening={false} // Don't interfere with node interactions
        />
      )}
      
      {/* Orbital circle for child nodes (level 2) */}
      {level2Radius > 0 && (
        <Circle
          x={centerX}
          y={centerY}
          radius={level2Radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.4)" // Even more subtle for outer circle
          strokeWidth={4}
          dash={[12, 12]} // Slightly different dash pattern
          lineCap="butt"
          perfectDrawEnabled={false}
          listening={false} // Don't interfere with node interactions
        />
      )}
    </Group>
  );
};

export default OrbitalCircles;
