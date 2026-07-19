import React, { useRef } from 'react';
import { Text, Group } from 'react-konva';
import { useSkillTreeStore, type SkillNode as SkillNodeType } from '../store/skillTreeStore';
import type Konva from 'konva';
import { getConstellationPosition } from '../utils/constellationPosition';
import { getMobilePosition } from '../utils/mobilePosition';
import AsciiNodeBody from './AsciiNodeBody';
import {
  BLACKHOLE_PALETTE,
  PLANET_PROFILES,
  ASTEROID_PROFILES,
  DWARF_PLANET_PROFILE,
  MOON_REAL,
  MOON_INFORMAL,
  EARTH_PROFILE,
  hashStr,
  type PlanetProfile,
} from '../utils/celestialBodies';

// Pixel art constants - actual sizes for the bounding regions
const NODE_SIZES = {
  LEVEL_0: 220,  // Center node (black hole)
  LEVEL_1: 108,  // Category nodes (planets)
  DWARF: 58,     // Dwarf planets (formerly comets) — much smaller
  ASTEROID: 90,  // Asteroids — slightly smaller than before
};

// Deterministic category → planet mapping so each category reads as a distinct
// real world; unknown level-1 ids fall back to a hashed profile.
const PLANET_PROFILE_NAMES = Object.keys(PLANET_PROFILES);
const CATEGORY_PLANETS: Record<string, keyof typeof PLANET_PROFILES> = {
  projects: 'jupiter',
  experience: 'mars',
  contact: 'uranus',
};

// Per-node body-size overrides. The two informal-experience moons (a club
// experience and a HS co-op) read a touch smaller than the real-internship moon.
const NODE_SIZE_OVERRIDES: Record<string, number> = {
  experience_owh: 76,     // Our Wave Hub (HS co-op)
  experience_vertige: 76, // Vertige Investment Group (club experience)
};

// Explicit asteroid-variety overrides for the project nodes. Listed here, a node
// is forced to render as an asteroid (never a dwarf planet) with a deliberately
// chosen rock type rather than whatever its id-hash happens to pick. The value
// indexes ASTEROID_PROFILES: 0 = grey carbonaceous (Type A), 1 = brown metallic
// (Type B).
const ASTEROID_VARIANT_OVERRIDES: Record<string, number> = {
  // Brown metallic asteroids
  project_honck: 1,
  project_ss: 1,
  project_recipelens: 1,
  // Grey carbonaceous asteroids
  project_syncer: 0,
  project_toygfs: 0,
  project_lstm: 0,
};

// The experience nodes render as moons — round cratered spheres orbiting the
// Experience planet — distinct from the irregular project asteroids. AgencyAnalytics
// (a real internship) gets the warm blue+brown moon; Vertige (a club experience)
// and Our Wave Hub (a HS co-op) share the ashen "informal" moon so they read as
// not-real-internships. The separate "Education" node is intentionally left out.
const MOON_NODE_PROFILES: Record<string, PlanetProfile> = {
  experience_agency: MOON_REAL,
  experience_vertige: MOON_INFORMAL[0],
  experience_owh: MOON_INFORMAL[1],
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
}

const SkillNode: React.FC<SkillNodeProps> = ({
  node,
  centerX,
  centerY,
  scale = 1
}) => {
  const { setHoveredNode, focusNode, uiMode, focusedNodeId, nodes } = useSkillTreeStore();
  const nodeShapeRef = useRef<Konva.Group>(null);

  // Calculate position based on UI mode
  const { x, y } = uiMode === 'mobile'
    ? getMobilePosition(node, centerX, centerY, scale)
    : getConstellationPosition(node, centerX, centerY, scale);
  
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
        baseFontSize = radius * 0.26; // centre node — a touch smaller so "Adnan Jalil" fits one line
        break;
      case 1:
        baseFontSize = radius * 0.33;
        break;
      case 2:
        baseFontSize = radius * 0.355; // outermost nodes (comets/asteroids) — slightly smaller
        break;
      default:
        baseFontSize = radius * 0.28;
    }
    return Math.max(baseFontSize, 10);
  };
  
  const getTextConfig = () => {
    // Labels sit just BELOW the body (top-anchored → offsetY 0, verticalAlign top).
    const labelY = y + bodySize / 2 + 6;
    switch (node.level) {
      case 0:
        return { width: radius * 2.2, height: radius * 1.7, offsetX: radius * 1.1, offsetY: 0, y: labelY, lineHeight: 1.1 };
      case 1:
        return { width: radius * 2.4, height: radius * 1.9, offsetX: radius * 1.2, offsetY: 0, y: labelY, lineHeight: 1.2 };
      case 2:
        // Wide enough that a long single-word company label (e.g. "AgencyAnalytics")
        // stays on one contiguous line instead of breaking mid-word.
        return { width: radius * 3.6, height: radius * 2.1, offsetX: radius * 1.8, offsetY: 0, y: labelY, lineHeight: 1.2 };
      default:
        return { width: radius * 3.6, height: radius * 2.1, offsetX: radius * 1.8, offsetY: 0, y: labelY, lineHeight: 1.2 };
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
        // Education → Earth (a habitable home world hanging off the black hole).
        if (node.id === 'skill_education') {
          return (
            <AsciiNodeBody
              {...commonProps}
              type="planet"
              palette={EARTH_PROFILE.palette}
              planetProfile={EARTH_PROFILE}
              speedMul={0.85}
              size={bodySize}
            />
          );
        }
        // Experience nodes → moons (cratered spheres).
        const moon = MOON_NODE_PROFILES[node.id];
        if (moon) {
          return (
            <AsciiNodeBody
              {...commonProps}
              type="planet"
              palette={moon.palette}
              planetProfile={moon}
              speedMul={0.7}
              size={bodySize}
            />
          );
        }
        const variantOverride = ASTEROID_VARIANT_OVERRIDES[node.id];
        // Overridden nodes are always asteroids; otherwise even-hash → dwarf planet.
        const isDwarf = variantOverride === undefined && seed % 2 === 0;
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
        // Asteroid: use the explicit per-node override when set, else alternate
        // between the two asteroid varieties.
        const asteroidProfile =
          ASTEROID_PROFILES[variantOverride ?? getAsteroidVariant(nodes, node.id)];
        return (
          <AsciiNodeBody
            {...commonProps}
            type="asteroid"
            palette={asteroidProfile.palette}
            asteroidProfile={asteroidProfile}
            // Higher seed bits (bit 0 already picks dwarf vs asteroid) → a
            // decorrelated 0-3 spin variant so neighbours tumble differently.
            spinVariant={(seed >>> 5) & 3}
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
  // The centre node's name is hand-split onto two lines ("Firas" / "Adnan
  // Jalil") so it never fragments one word per line; the widened level-0 label
  // box (getTextConfig) keeps the second line together.
  const labelText = node.id === 'center' ? 'Firas\nAdnan Jalil' : node.label;

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
              text={labelText}
              fontSize={fontSize}
              fontFamily="'Roboto Mono', monospace"
              fontStyle="400"
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
        text={labelText}
        fontSize={fontSize}
        fontFamily="'Roboto Mono', monospace"
        fontStyle="400"
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
