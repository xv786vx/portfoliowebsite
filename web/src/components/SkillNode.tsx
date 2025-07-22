import React, { useEffect, useRef } from 'react';
import { Circle, Text, Group, Image } from 'react-konva';
import { useSkillTreeStore, type SkillNode as SkillNodeType } from '../store/skillTreeStore';
import useImage from 'use-image';
import type Konva from 'konva';
import { getOrbitalPosition } from '../utils/orbitalPosition';
import { getStaticPosition } from '../utils/staticPosition';

// Import pixel art sprites at exact target sizes
import squareSprite from '../assets/nnewcentral240.png'; // Central Node - 240px

// Category node sprites - each gets unique hexagon
import projectsSprite from '../assets/newhexagon4_120.png'; // Projects
import experienceSprite from '../assets/newhexagon1_120.png'; // Experience  
import skillsSprite from '../assets/newhexagon3_120.png'; // Skills
import contactSprite from '../assets/newhexagon2_120.png'; // Contact  

// Child node sprites - alternating circles
import circle1Sprite from '../assets/newcircle1_88.png'; // Even positioned child nodes
import circle2Sprite from '../assets/newcircle2_88.png'; // Odd positioned child nodes  

// Function to get the correct sprite for category nodes based on node ID
const getCategorySprite = (nodeId: string): string => {
  switch (nodeId) {
    case 'projects':
      return projectsSprite;
    case 'experience':
      return experienceSprite;
    case 'skills':
      return skillsSprite;
    case 'contact':
      return contactSprite;
    default:
      return experienceSprite; // fallback
  }
};

const getChildNodeSprite = (nodeId: string): string => {
  // Get all level 2 (child) nodes and sort them by ID for consistent ordering
  const allNodes = useSkillTreeStore.getState().nodes;
  const childNodes = allNodes.filter(n => n.level === 2).sort((a, b) => a.id.localeCompare(b.id));
  
  // Find the index of this node among all child nodes
  const nodeIndex = childNodes.findIndex(n => n.id === nodeId);
  
  // Even index = circle1, Odd index = circle2
  return nodeIndex % 2 === 0 ? circle1Sprite : circle2Sprite;
};

// Pixel art constants - actual sizes matching your sprites
const NODE_SIZES = {
  LEVEL_0: 200, // Center node (hexagon)
  LEVEL_1: 108, // Category nodes (circle)
  LEVEL_2: 88,  // Skill nodes (alternating circles)
  LEVEL_3: 80,  // Additional nodes (square)
};

// Component for rendering pixelated ring effects
const PixelatedRing: React.FC<{
  x: number;
  y: number;
  radius: number;
  color: string;
  isActive: boolean;
  glowRef?: React.RefObject<Konva.Group | null>;
}> = ({ x, y, radius, color, isActive, glowRef }) => {
  return (
    <Group ref={glowRef} x={x} y={y}>
      {/* Outer ring */}
      <Circle
        radius={radius * 1.4}
        fill="transparent"
        stroke={color}
        strokeWidth={2}
        opacity={isActive ? 0.3 : 0.15}
        dash={[12, 12]}
        lineCap="butt"
        perfectDrawEnabled={false}
      />
      {/* Middle ring */}
      <Circle
        radius={radius * 1.25}
        fill="transparent"
        stroke={color}
        strokeWidth={3}
        opacity={isActive ? 0.5 : 0.25}
        dash={[8, 8]}
        lineCap="butt"
        perfectDrawEnabled={false}
      />
      {/* Inner ring */}
      <Circle
        radius={radius * 1.1}
        fill="transparent"
        stroke={color}
        strokeWidth={4}
        opacity={isActive ? 0.7 : 0.35}
        dash={[4, 4]}
        lineCap="butt"
        perfectDrawEnabled={false}
      />
    </Group>
  );
};

// Component for rendering pixel art sprites at exact sizes (no scaling)
const PixelSprite: React.FC<{
  src: string;
  x: number;
  y: number;
  size: number; // Exact pixel size of the sprite
  onClick?: () => void;
  onTap?: () => void;
  onTouchStart?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}> = ({ src, x, y, size, onClick, onMouseEnter, onMouseLeave }) => {
  const [image] = useImage(src);
  return (
    <Image
      image={image}
      x={x - size / 2} // Center the sprite
      y={y - size / 2}
      width={size}
      height={size}
      onClick={onClick}
      onTap={onClick}
      onTouchStart={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      perfectDrawEnabled={false}
      imageSmoothingEnabled={false}
      pixelRatio={1}
      filters={[]}
      cache={false}
      listening={true}
    />
  );
};

interface SkillNodeProps {
  node: SkillNodeType;
  centerX: number;
  centerY: number;
  scale?: number;
  animationTime?: number;
}

const SkillNode: React.FC<SkillNodeProps> = ({ 
  node, 
  centerX, 
  centerY, 
  scale = 1,
  animationTime = 0
}) => {
  const { setActiveNode, setHoveredNode, openDetailModal, uiMode } = useSkillTreeStore();
  const glowRingRef = useRef<Konva.Group>(null);
  const nodeShapeRef = useRef<Konva.Group>(null);
  
  // Calculate position based on UI mode
  const { x, y } = uiMode === 'orbital' 
    ? getOrbitalPosition(node, centerX, centerY, scale, animationTime)
    : getStaticPosition(node, centerX, centerY, scale);
  
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

  // Animate the node shape rotation when active
  useEffect(() => {
    if (!nodeShapeRef.current) return;
    
    const shape = nodeShapeRef.current;
    const layer = shape.getLayer();
    
    let animationId: number;
    
    if (node.isActive) {
      // Continuous rotation when active
      const animate = () => {
        shape.rotate(-0.05); // 0.05 degrees per frame for slower, more mystical rotation
        layer?.batchDraw();
        animationId = requestAnimationFrame(animate);
      };
      animationId = requestAnimationFrame(animate);
    } else {
      // Smooth transition back to original rotation when deactivated
      const currentRotation = shape.rotation();
      const targetRotation = 0; // Original rotation
      const rotationDifference = targetRotation - currentRotation;
      
      // Normalize the rotation difference to find the shortest path
      let normalizedDiff = rotationDifference % 360;
      if (normalizedDiff > 180) normalizedDiff -= 360;
      if (normalizedDiff < -180) normalizedDiff += 360;
      
      if (Math.abs(normalizedDiff) > 0.1) { // Only animate if there's a significant difference
        const animate = () => {
          const current = shape.rotation();
          const remaining = targetRotation - current;
          
          // Normalize remaining rotation
          let normalizedRemaining = remaining % 360;
          if (normalizedRemaining > 180) normalizedRemaining -= 360;
          if (normalizedRemaining < -180) normalizedRemaining += 360;
          
          if (Math.abs(normalizedRemaining) > 0.1) {
            shape.rotate(normalizedRemaining * 0.08); // Smooth easing
            layer?.batchDraw();
            animationId = requestAnimationFrame(animate);
          } else {
            // Snap to exact position when close enough
            shape.rotation(targetRotation);
            layer?.batchDraw();
          }
        };
        animationId = requestAnimationFrame(animate);
      }
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [node.isActive]);
  
  // Base radius depends on level (center node is larger)
  const baseRadius = node.level === 0 ? 80 : node.level === 1 ? 55 : node.level === 2 ? 40 : 30;
  const radius = baseRadius * scale;
  
  // Calculate font size based on node level and radius with better spacing
  const getFontSize = () => {
    let baseFontSize;
    switch (node.level) {
      case 0: // Center node - needs more padding inside the pentagon
        baseFontSize = radius * 0.238; // Reduced from 0.25 to 0.18 for better spacing
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
      case 0: // Center square - needs tighter wrapping area for multi-line text
        return {
          width: radius * 1.8, // Narrower width forces wrapping for longer text
          height: radius * 1.4, // Height constraint for square interior
          offsetX: radius * 0.9,
          offsetY: radius * 0.7, // Offset for vertical centering
          y: y,
          lineHeight: 1.1, // Tighter line spacing for square
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

  // Render different shapes based on level using exact-sized pixel art sprites
  const renderNodeShape = () => {
    const commonProps = {
      onClick: handleClick,
      onTap: handleClick,
      onTouchStart: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    };

    switch (node.level) {
      case 0: // Level 0 - Central node (hexagon)
        return (
          <PixelSprite
            {...commonProps}
            src={squareSprite}
            x={0}
            y={0}
            size={NODE_SIZES.LEVEL_0 * scale}
          />
        );
      case 1: // Level 1 - Category nodes
        return (
          <PixelSprite
            {...commonProps}
            src={getCategorySprite(node.id)}
            x={0}
            y={0}
            size={NODE_SIZES.LEVEL_1 * scale}
          />
        );
      case 2: // Level 2 - Skill nodes
        return (
          <PixelSprite
            {...commonProps}
            src={getChildNodeSprite(node.id)}
            x={0}
            y={0}
            size={NODE_SIZES.LEVEL_2 * scale}
          />
        );
      default: // Fallback to square
        return (
          <PixelSprite
            {...commonProps}
            src={squareSprite}
            x={0}
            y={0}
            size={NODE_SIZES.LEVEL_3 * scale}
          />
        );
    }
  };
  
  const handleClick = () => {
    // Always set this node as active (centers it if not already active)
    setActiveNode(node.id);
    // Always open the detail modal immediately
    openDetailModal(node.id);
  };
  
  const handleMouseEnter = () => {
    setHoveredNode(node.id);
  };
  
  const handleMouseLeave = () => {
    setHoveredNode(null);
  };
  
  return (
    <Group>
      {/* Pixelated glow ring for active/hovered states */}
      {(node.isActive || node.isHovered) && (
        <PixelatedRing
          x={x}
          y={y}
          radius={radius}
          color={node.strokeColor || "#ffffff"} // Matrix green color
          isActive={node.isActive}
          glowRef={glowRingRef}
        />
      )}
      
      {/* Main node shape with rotation animation - different based on level */}
      <Group ref={nodeShapeRef} x={x} y={y}>
        {renderNodeShape()}
      </Group>
      
      {/* Node label with pixel art styling and outline effect */}
      {/* Black outline - render multiple times with offsets */}
      {[-2, -1, 0, 1, 2].map(dx => 
        [-2, -1, 0, 1, 2].map(dy => {
          // Skip the center (0,0) as that will be the main text
          if (dx === 0 && dy === 0) return null;
          
          return (
            <Text
              key={`outline-${dx}-${dy}`}
              x={x + dx}
              y={getTextConfig().y + dy}
              text={node.label}
              fontSize={getFontSize()}
              fontFamily="Pixelify Sans, sans-serif"
              fontStyle="700"
              fill="#000000" // Black outline
              align="center"
              verticalAlign="middle"
              width={getTextConfig().width}
              height={getTextConfig().height}
              offsetX={getTextConfig().offsetX}
              offsetY={getTextConfig().offsetY}
              lineHeight={getTextConfig().lineHeight}
              wrap="word"
              ellipsis={false}
              listening={false} // Don't interfere with main text interactions
            />
          );
        })
      )}
      
      {/* Main white text */}
      <Text
        x={x}
        y={getTextConfig().y}
        text={node.label}
        fontSize={getFontSize()}
        fontFamily="Pixelify Sans, sans-serif" // Pixel art font
        fontStyle="700" // Bold weight
        fill="#ffffff" // White text
        align="center"
        verticalAlign="middle"
        width={getTextConfig().width}
        height={getTextConfig().height}
        offsetX={getTextConfig().offsetX}
        offsetY={getTextConfig().offsetY}
        lineHeight={getTextConfig().lineHeight}
        wrap="word"
        ellipsis={false}
        onClick={handleClick}
        onTap={handleClick}
        onTouchStart={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </Group>
  );
};

export default SkillNode;
