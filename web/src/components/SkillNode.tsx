import React, { useRef } from 'react';
import { Text, Group } from 'react-konva';
import { useSkillTreeStore, type SkillNode as SkillNodeType } from '../store/skillTreeStore';
import type Konva from 'konva';
import { getOrbitalPosition } from '../utils/orbitalPosition';
import { getStaticPosition } from '../utils/staticPosition';
import { getConstellationPosition } from '../utils/constellationPosition';
import AsciiNodeBody from './AsciiNodeBody';
import {
  BLACKHOLE_PALETTE,
  PLANET_PALETTES,
  ASTEROID_PALETTE,
  COMET_PALETTE,
  hashStr,
} from '../utils/celestialBodies';

// Pixel art constants - actual sizes for the bounding regions
const NODE_SIZES = {
  LEVEL_0: 200, // Center node
  LEVEL_1: 108, // Category nodes
  LEVEL_2: 88,  // Skill nodes
  LEVEL_3: 80,  // Additional nodes
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
  const { setHoveredNode, focusNode, uiMode, focusedNodeId } = useSkillTreeStore();
  const nodeShapeRef = useRef<Konva.Group>(null);
  
  // Calculate position based on UI mode
  const { x, y } = uiMode === 'orbital'
    ? getOrbitalPosition(node, centerX, centerY, scale, animationTime)
    : uiMode === 'new'
    ? getConstellationPosition(node, centerX, centerY, scale)
    : getStaticPosition(node, centerX, centerY, scale);
  
  // Base radius depends on level
  const baseRadius = node.level === 0 ? 80 : node.level === 1 ? 55 : node.level === 2 ? 40 : 30;
  const radius = baseRadius * scale;
  
  // Calculate font size
  const getFontSize = () => {
    let baseFontSize;
    switch (node.level) {
      case 0:
        baseFontSize = radius * 0.238; 
        break;
      case 1:
        baseFontSize = radius * 0.28;
        break;
      case 2:
        baseFontSize = radius * 0.36;
        break;
      default:
        baseFontSize = radius * 0.28;
    }
    return Math.max(baseFontSize, 8);
  };
  
  const getTextConfig = () => {
    switch (node.level) {
      case 0: 
        return {
          width: radius * 1.8, 
          height: radius * 1.4, 
          offsetX: radius * 0.9,
          offsetY: radius * 0.7, 
          y: y,
          lineHeight: 1.1, 
        };
      case 1: 
        return {
          width: radius * 2.4,
          height: radius * 1.6,
          offsetX: radius * 1.2,
          offsetY: radius * 0.8,
          y: y,
          lineHeight: 1.2,
        };
      case 2: 
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

  const handleClick = () => {
    focusNode(node.id);
  };
  
  const handleMouseEnter = () => {
    setHoveredNode(node.id);
  };
  
  const handleMouseLeave = () => {
    setHoveredNode(null);
  };

  // Angle (screen space) from this body toward the black hole at the scene
  // center — the shared light source every body in the system is lit from.
  const lightAngle = Math.atan2(centerY - y, centerX - x);

  const renderNodeShape = () => {
    const commonProps = {
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      isHovered: node.isHovered || node.isActive,
      lightAngle,
      x: 0,
      y: 0,
    };

    const seed = hashStr(node.id);

    switch (node.level) {
      case 0: // Level 0 - Central node → black hole
        return (
          <AsciiNodeBody
            {...commonProps}
            type="blackhole"
            palette={BLACKHOLE_PALETTE}
            speedMul={1}
            size={NODE_SIZES.LEVEL_0 * scale}
          />
        );
      case 1: // Level 1 - Category nodes → planets (natural, varied palette per node)
        return (
          <AsciiNodeBody
            {...commonProps}
            type="planet"
            palette={PLANET_PALETTES[seed % PLANET_PALETTES.length]}
            speedMul={1}
            size={NODE_SIZES.LEVEL_1 * scale}
          />
        );
      case 2: // Level 2 - Outer nodes → asteroid or comet (stable per node id)
      default: {
        const isComet = seed % 2 === 0;
        return (
          <AsciiNodeBody
            {...commonProps}
            type={isComet ? 'comet' : 'asteroid'}
            palette={isComet ? COMET_PALETTE : ASTEROID_PALETTE}
            speedMul={isComet ? 0.6 : 1}
            size={NODE_SIZES.LEVEL_2 * scale}
          />
        );
      }
    }
  };
  
  // When a node is focused (zoomed in), hide every other node so only the
  // focused planet shows against the solid charcoal background.
  if (focusedNodeId && focusedNodeId !== node.id) return null;

  // Computed once per render instead of repeatedly (the outline loop below
  // would otherwise call these ~6 times per iteration x 24 iterations).
  const fontSize = getFontSize();
  const textConfig = getTextConfig();

  return (
    <Group>
      {/* Main node shape */}
      <Group ref={nodeShapeRef} x={x} y={y}>
        {renderNodeShape()}
      </Group>

      {/* Node label with pixel art styling and outline effect */}
      {[-2, -1, 0, 1, 2].map(dx =>
        [-2, -1, 0, 1, 2].map(dy => {
          if (dx === 0 && dy === 0) return null;

          return (
            <Text
              key={`outline-${dx}-${dy}`}
              x={x + dx}
              y={textConfig.y + dy}
              text={node.label}
              fontSize={fontSize}
              fontFamily="'Roboto Mono', monospace"
              fontStyle="700"
              fill="#000000" // Black outline
              align="center"
              verticalAlign="middle"
              width={textConfig.width}
              height={textConfig.height}
              offsetX={textConfig.offsetX}
              offsetY={textConfig.offsetY}
              lineHeight={textConfig.lineHeight}
              wrap="word"
              ellipsis={false}
              listening={false}
            />
          );
        })
      )}

      {/* Main white text */}
      <Text
        x={x}
        y={textConfig.y}
        text={node.label}
        fontSize={fontSize}
        fontFamily="'Roboto Mono', monospace"
        fontStyle="700"
        fill="#ffffff"
        align="center"
        verticalAlign="middle"
        width={textConfig.width}
        height={textConfig.height}
        offsetX={textConfig.offsetX}
        offsetY={textConfig.offsetY}
        lineHeight={textConfig.lineHeight}
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
