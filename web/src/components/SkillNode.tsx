import React, { useEffect, useRef } from 'react';
import { Circle, Text, Group, Path } from 'react-konva';
import { useSkillTreeStore, type SkillNode as SkillNodeType } from '../store/skillTreeStore';
import type Konva from 'konva';

interface SkillNodeProps {
  node: SkillNodeType;
  centerX: number;
  centerY: number;
  scale?: number;
}

const SkillNode: React.FC<SkillNodeProps> = ({ 
  node, 
  centerX, 
  centerY, 
  scale = 1 
}) => {
  const { setActiveNode, setHoveredNode } = useSkillTreeStore();
  const glowRingRef = useRef<Konva.Circle>(null);
  
  const x = centerX + node.position.x * scale;
  const y = centerY + node.position.y * scale;
  
  // Animate the glow ring rotation
  useEffect(() => {
    if (!glowRingRef.current || (!node.isActive && !node.isHovered)) return;
    
    const ring = glowRingRef.current;
    const layer = ring.getLayer();
    
    let animationId: number;
    const animate = () => {
      // Rotate the ring slowly (360 degrees in 8 seconds)
      ring.rotate(0.1); // 0.5 degrees per frame
      layer?.batchDraw();
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [node.isActive, node.isHovered]);
  
  // Base radius depends on level (center node is larger)
  const baseRadius = node.level === 0 ? 70 : node.level === 1 ? 45 : node.level === 2 ? 30 : 30;
  const radius = baseRadius * scale;
  
  // Custom SVG path definitions (scaled to fit radius)
  const svgPaths = {
    // Hexagon for level 1 nodes
    hexagon: `M ${radius * 0.866} ${radius * 0.5} L ${radius * 0.866} ${radius * -0.5} L 0 ${radius * -1} L ${radius * -0.866} ${radius * -0.5} L ${radius * -0.866} ${radius * 0.5} L 0 ${radius} Z`,
    
    // Upside-down pentagon for level 3 nodes
    pentagonUpsideDown: `M 0 ${radius} L ${radius * 0.951} ${radius * 0.309} L ${radius * 0.588} ${radius * -0.809} L ${radius * -0.588} ${radius * -0.809} L ${radius * -0.951} ${radius * 0.309} Z`,
    };
  
  // Dynamic styling based on state
  const getNodeStyle = () => {
    const baseStyle = {
      radius,
      fill: '#181818',
      stroke: node.strokeColor || '#ffffff',
      strokeWidth: 2,
      shadowBlur: 0,
      shadowColor: 'transparent',
    };
    
    if (node.isActive) {
      return {
        ...baseStyle,
        shadowBlur: 20,
        shadowColor: node.strokeColor,
        strokeWidth: 4,
        stroke: node.strokeColor || '#ffffff',
      };
    }
    
    if (node.isHovered) {
      return {
        ...baseStyle,
        shadowBlur: 15,
        shadowColor: node.strokeColor,
        strokeWidth: 3,
        radius: radius * 1,
      };
    }
    
    return baseStyle;
  };
  
  const nodeStyle = getNodeStyle();
  
  // Render different shapes based on level
  const renderNodeShape = () => {
    const commonProps = {
      x,
      y,
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      perfectDrawEnabled: false,
    };

    switch (node.level) {

        case 0: // Level 0 - Upside-down Pentagon
          return (
            <Path
              {...commonProps}
              data={svgPaths.pentagonUpsideDown}
              fill={nodeStyle.fill}
              stroke={nodeStyle.stroke}
              strokeWidth={nodeStyle.strokeWidth}
              shadowBlur={nodeStyle.shadowBlur}
              shadowColor={nodeStyle.shadowColor}
              offsetX={0}
              offsetY={0}
            />
          );
      
      case 1: // Level 1 - Hexagon
        return (
          <Path
            {...commonProps}
            data={svgPaths.hexagon}
            fill={nodeStyle.fill}
            stroke={nodeStyle.stroke}
            strokeWidth={nodeStyle.strokeWidth}
            shadowBlur={nodeStyle.shadowBlur}
            shadowColor={nodeStyle.shadowColor}
            offsetX={0}
            offsetY={0}
          />
        );
      
      case 2: // Level 2 - Circle
        return (
          <Circle
            {...commonProps}
            {...nodeStyle}
          />
        );
        
      
      default: // Fallback to circle
        return (
          <Circle
            {...commonProps}
            {...nodeStyle}
          />
        );
    }
  };
  
  const handleClick = () => {
    setActiveNode(node.id);
  };
  
  const handleMouseEnter = () => {
    setHoveredNode(node.id);
  };
  
  const handleMouseLeave = () => {
    setHoveredNode(null);
  };
  
  return (
    <Group>
      {/* Outer glow ring for active/hovered states */}
      {(node.isActive || node.isHovered) && (
        <Circle
          ref={glowRingRef}
          x={x}
          y={y}
          radius={radius * 1.3}
          fill="transparent"
          stroke={node.strokeColor}
          strokeWidth={2}
          opacity={node.isActive ? 0.6 : 0.3}
          dash={[5, 5]}
        />
      )}
      
      {/* Main node shape - different based on level */}
      {renderNodeShape()}
      
      {/* Node label */}
      <Text
        x={x}
        y={y-5}
        text={node.label}
        fontSize={Math.max(12 * scale, 10)}
        fontFamily="Lusitana, serif"
        fontStyle="bold"
        fill="#ffffff"
        align="center"
        verticalAlign="middle"
        width={radius * 4}
        offsetX={radius * 2}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </Group>
  );
};

export default SkillNode;
