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
  PLANET_PROFILES,
  ASTEROID_PROFILES,
  DWARF_PLANET_PROFILE,
  hashStr,
} from '../utils/celestialBodies';

// Pixel art constants - actual sizes for the bounding regions
const NODE_SIZES = {
  LEVEL_0: 240,  // Center node (black hole)
  LEVEL_1: 108,  // Category nodes (planets)
  DWARF: 58,     // Dwarf planets (formerly comets) — much smaller
  ASTEROID: 90,  // Asteroids — slightly smaller than before
};

// Deterministic category → planet mapping so each category reads as a distinct
// real world; unknown level-1 ids fall back to a hashed profile.
const PLANET_PROFILE_NAMES = Object.keys(PLANET_PROFILES);
const CATEGORY_PLANETS: Record<string, keyof typeof PLANET_PROFILES> = {
  projects: 'jupiter',
  skills: 'neptune',
  experience: 'mars',
  contact: 'uranus',
};

// Per-node body-size overrides (dwarf planets). The internship nodes read a bit
// larger than their sibling dwarf planets.
const NODE_SIZE_OVERRIDES: Record<string, number> = {
  experience_owh: 84,     // Mobile Developer Intern
  experience_vertige: 84, // Data Analyst Intern
};

// A node renders as an asteroid when it's an outer (level ≥ 2) node whose id-hash
// is odd (even → comet). Mirrors the branch in renderNodeShape.
const isAsteroidNode = (n: SkillNodeType) =>
  n.level !== 0 && n.level !== 1 && hashStr(n.id) % 2 !== 0;

// Assign the two asteroid profiles in ALTERNATING order (A,B,A,B,…) across the
// asteroid nodes, in store order, so neighbouring rocks don't look identical.
// Memoised on the nodes-array reference (rebuilt cheaply when it changes).
let _astNodesRef: SkillNodeType[] | null = null;
let _astVariant = new Map<string, number>();
const getAsteroidVariant = (nodes: SkillNodeType[], id: string): number => {
  if (_astNodesRef !== nodes) {
    _astVariant = new Map();
    let i = 0;
    for (const n of nodes) {
      if (isAsteroidNode(n)) _astVariant.set(n.id, i++ % ASTEROID_PROFILES.length);
    }
    _astNodesRef = nodes;
  }
  return _astVariant.get(id) ?? 0;
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
  const { setHoveredNode, focusNode, uiMode, focusedNodeId, nodes } = useSkillTreeStore();
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

  // Actual rendered body size (mirrors renderNodeShape) — used to place the label
  // just below the body. Level-2 splits into dwarf planets vs asteroids.
  const bodySize = node.level === 0
    ? NODE_SIZES.LEVEL_0 * scale
    : node.level === 1
    ? NODE_SIZES.LEVEL_1 * scale
    : hashStr(node.id) % 2 === 0
    ? (NODE_SIZE_OVERRIDES[node.id] ?? NODE_SIZES.DWARF) * scale // dwarf planet
    : NODE_SIZES.ASTEROID * scale;                              // asteroid

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
        baseFontSize = radius * 0.30; // outermost nodes (comets/asteroids) — slightly smaller
        break;
      default:
        baseFontSize = radius * 0.24;
    }
    return Math.max(baseFontSize, 8);
  };
  
  const getTextConfig = () => {
    // Labels sit just BELOW the body (top-anchored → offsetY 0, verticalAlign top).
    const labelY = y + bodySize / 2 + 6;
    switch (node.level) {
      case 0:
        return { width: radius * 1.8, height: radius * 1.4, offsetX: radius * 0.9, offsetY: 0, y: labelY, lineHeight: 1.1 };
      case 1:
        return { width: radius * 2.4, height: radius * 1.6, offsetX: radius * 1.2, offsetY: 0, y: labelY, lineHeight: 1.2 };
      case 2:
        return { width: radius * 2.8, height: radius * 1.8, offsetX: radius * 1.4, offsetY: 0, y: labelY, lineHeight: 1.2 };
      default:
        return { width: radius * 2.8, height: radius * 1.8, offsetX: radius * 1.4, offsetY: 0, y: labelY, lineHeight: 1.2 };
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
      case 1: { // Level 1 - Category nodes → distinct planets (Jupiter/Neptune/Mars/Uranus)
        const profileName = CATEGORY_PLANETS[node.id]
          ?? PLANET_PROFILE_NAMES[seed % PLANET_PROFILE_NAMES.length];
        const profile = PLANET_PROFILES[profileName];
        return (
          <AsciiNodeBody
            {...commonProps}
            type="planet"
            palette={profile.palette}
            planetProfile={profile}
            speedMul={1}
            size={NODE_SIZES.LEVEL_1 * scale}
          />
        );
      }
      case 2: // Level 2 - Outer nodes → dwarf planet or asteroid (stable per node id)
      default: {
        const isDwarf = seed % 2 === 0; // formerly comets → now icy cratered dwarf planets
        if (isDwarf) {
          return (
            <AsciiNodeBody
              {...commonProps}
              type="planet"
              palette={DWARF_PLANET_PROFILE.palette}
              planetProfile={DWARF_PLANET_PROFILE}
              speedMul={0.6}
              size={bodySize}
            />
          );
        }
        // Asteroid: alternate between the two asteroid varieties.
        const asteroidProfile = ASTEROID_PROFILES[getAsteroidVariant(nodes, node.id)];
        return (
          <AsciiNodeBody
            {...commonProps}
            type="asteroid"
            palette={asteroidProfile.palette}
            asteroidProfile={asteroidProfile}
            speedMul={1}
            size={bodySize}
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
              fontStyle="300"
              fill="#000000" // Black outline
              align="center"
              verticalAlign="top"
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
        fontStyle="300"
        fill="#ffffff"
        align="center"
        verticalAlign="top"
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
