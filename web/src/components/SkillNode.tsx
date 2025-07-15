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
  
  // Calculate font size based on node level and radius with better spacing
  const getFontSize = () => {
    let baseFontSize;
    switch (node.level) {
      case 0: // Center node - needs more padding inside the pentagon
        baseFontSize = radius * 0.26; // Reduced from 0.25 to 0.18 for better spacing
        break;
      case 1: // First ring - hexagon has good space
        baseFontSize = radius * 0.28; // Reduced from 0.32 to 0.28
        break;
      case 2: // Outer ring - circles are smaller
        baseFontSize = radius * 0.36; // Reduced from 0.38 to 0.32
        break;
      default:
        baseFontSize = radius * 0.28;
    }
    
    // Ensure minimum font size and scale appropriately
    return Math.max(baseFontSize, 8);
  };
  
  // Calculate text positioning and wrapping based on node shape
  const getTextConfig = () => {
    switch (node.level) {
      case 0: // Center pentagon - needs tighter wrapping area for multi-line text
        return {
          width: radius * 1.8, // Narrower width forces wrapping for longer text
          height: radius * 1.4, // Height constraint for pentagon interior
          offsetX: radius * 0.9,
          offsetY: radius * 0.7, // Offset for vertical centering
          y: y,
          lineHeight: 1.1, // Tighter line spacing for pentagon
        };
      case 1: // Hexagon - good horizontal and vertical space
        return {
          width: radius * 2.4,
          height: radius * 1.6,
          offsetX: radius * 1.2,
          offsetY: radius * 0.8,
          y: y,
          lineHeight: 1.2,
        };
      case 2: // Circle - standard spacing with wrapping
        return {
          width: radius * 2.8,
          height: radius * 1.8,
          offsetX: radius * 1.4,
          offsetY: radius * 0.9,
          y: y,
          lineHeight: 1.2,
        };
      default:
        return {
          width: radius * 2.8,
          height: radius * 1.8,
          offsetX: radius * 1.4,
          offsetY: radius * 0.9,
          y: y,
          lineHeight: 1.2,
        };
    }
  };
  
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
      
      {/* Node label with text wrapping */}
      <Text
        x={x}
        y={getTextConfig().y}
        text={node.label}
        fontSize={getFontSize()}
        fontFamily="PT Sans, sans-serif"
        fontStyle="bold"
        fill="#ffffff"
        align="center"
        verticalAlign="middle"
        width={getTextConfig().width}
        height={getTextConfig().height}
        offsetX={getTextConfig().offsetX}
        offsetY={getTextConfig().offsetY}
        lineHeight={getTextConfig().lineHeight}
        wrap="word" // Enable word wrapping
        ellipsis={false} // Don't truncate with "..."
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </Group>
  );
};

export default SkillNode;
