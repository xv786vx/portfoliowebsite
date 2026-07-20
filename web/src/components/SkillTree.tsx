import React, { useEffect, useRef, useState } from 'react';
import { Layer } from 'react-konva';
import { motion } from 'framer-motion';
import { useSkillTreeStore } from '../store/skillTreeStore';
import SkillNode from './SkillNode';
import ZoomPanStage, { type ZoomPanStageRef } from './ZoomPanStage';
import ConstellationLines from './ConstellationLines';
import AsciiBackground from './AsciiBackground';
import NodeInfoCard from './NodeInfoCard';
import MobileNodeModal from './MobileNodeModal';
import MobileLines from './MobileLines';

import { getConstellationPosition, getConstellationExtent } from '../utils/constellationPosition';
import {
  getMobileContentTop,
  getMobileContentHeight,
} from '../utils/mobilePosition';
import { useIsMobile } from '../hooks/useIsMobile';

// Import cursor images

// Camera scale when zoomed into a focused node.
const FOCUS_SCALE = 2.4;
// Fraction of screen width where a focused node is centered (right 75% region).
const FOCUS_SCREEN_X = 0.625;
// Padding (px) reserved around the constellation so node bodies + labels near
// the edges are never cropped when fitting the layout to the viewport.
const FIT_MARGIN = 110;

const SkillTree: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<ZoomPanStageRef>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);

  const {
    nodes,
    setUIMode,
    activeNodeId,
    hoveredNodeId,
    focusedNodeId,
    uiMode,
    clearFocus,
  } = useSkillTreeStore();

  const isMobile = useIsMobile();

  // Layout is locked: the vertical stack on mobile, the constellation on desktop.
  useEffect(() => {
    setUIMode(isMobile ? 'mobile' : 'new');
  }, [isMobile, setUIMode]);

  // Latest render values, read inside the focus effect without re-subscribing it
  // to every change (so the else-branch zoom-out doesn't fire spuriously).
  const latest = useRef({ nodes, scale, dimensions, uiMode });
  latest.current = { nodes, scale, dimensions, uiMode };

  // Responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Fit the layout to the viewport. Desktop: shrink the constellation so its
  // outermost node bodies (+ labels) always stay on screen. Mobile: size the
  // stacked bodies to the viewport width.
  useEffect(() => {
    const { width, height } = dimensions;
    if (isMobile) {
      setScale(Math.min(1, width / 460));
      return;
    }
    const { maxX, maxY } = getConstellationExtent();
    const fit = Math.min(
      1,
      (width / 2 - FIT_MARGIN) / maxX,
      (height / 2 - FIT_MARGIN) / maxY
    );
    setScale(Math.max(0.35, fit));
  }, [dimensions, isMobile]);

  // Camera: zoom into the focused node, or back out to the whole universe.
  // Desktop only — on mobile a focused node opens a full-screen modal instead,
  // and the tall vertical canvas must not be transformed.
  useEffect(() => {
    if (isMobile) return;
    if (!stageRef.current) return;
    const { nodes, scale, dimensions } = latest.current;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    if (focusedNodeId) {
      const node = nodes.find((n) => n.id === focusedNodeId);
      if (!node) return;
      const pos = getConstellationPosition(node, centerX, centerY, scale);
      // Land the node in the middle of the right 75% (left 25% holds the panel).
      stageRef.current.zoomTo(
        pos.x,
        pos.y,
        FOCUS_SCALE,
        0.9,
        dimensions.width * FOCUS_SCREEN_X,
        dimensions.height / 2
      );
    } else {
      stageRef.current.zoomTo(centerX, centerY, 1, 0.9);
    }
  }, [focusedNodeId, isMobile]);

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  // Mobile: nodes stack down a tall, scrollable canvas. `contentTop` is fed to
  // the shared position fns via the `centerY` slot.
  const mobileContentTop = getMobileContentTop(scale);
  const stageHeight = isMobile ? getMobileContentHeight(scale) : dimensions.height;
  const nodeCenterY = isMobile ? mobileContentTop : centerY;

  // Desktop: clicking empty space backs out of a focused node. On mobile the
  // full-screen modal covers the canvas and its ✕ is the way out.
  const handleBackgroundClick = React.useCallback(() => {
    if (!isMobile && focusedNodeId) clearFocus();
  }, [isMobile, focusedNodeId, clearFocus]);

  const getCursorStyle = () => {
    if (hoveredNodeId && hoveredNodeId === activeNodeId) {
      return 'pointer';
    }
    return 'auto';
  };

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflowX: 'hidden',
        overflowY: isMobile ? 'auto' : 'hidden',
        backgroundColor: '#000000',
        margin: 0,
        padding: 0,
        cursor: getCursorStyle(),
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Animated ASCII nebula (behind everything, stays fixed while scrolling) */}
      <AsciiBackground />

      {/* Konva stage (planets) — above the background */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <ZoomPanStage
          ref={stageRef}
          width={dimensions.width}
          height={stageHeight}
          interactive={false}
          onBackgroundClick={handleBackgroundClick}
        >
          <Layer>
            {uiMode === 'new' && !focusedNodeId && (
              <ConstellationLines centerX={centerX} centerY={centerY} scale={scale} />
            )}

            {uiMode === 'mobile' && (
              <MobileLines centerX={centerX} contentTop={mobileContentTop} scale={scale} />
            )}

            {nodes.map((node) => (
              <SkillNode
                key={node.id}
                node={node}
                centerX={centerX}
                centerY={nodeCenterY}
                scale={scale}
              />
            ))}
          </Layer>
        </ZoomPanStage>
      </div>

      {/* Focused-node details: left panel on desktop, full-screen on mobile */}
      {isMobile ? <MobileNodeModal /> : <NodeInfoCard />}
    </motion.div>
  );
};

export default SkillTree;
