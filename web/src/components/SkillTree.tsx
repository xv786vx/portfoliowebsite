import React, { useEffect, useRef, useState } from 'react';
import { Layer } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkillTreeStore } from '../store/skillTreeStore';
import SkillNode from './SkillNode';
import OrbitalCircles from './OrbitalCircles';
import ZoomPanStage, { type ZoomPanStageRef } from './ZoomPanStage';
import ConnectionLines from './ConnectionLines';
import ConstellationLines from './ConstellationLines';
import UIToggle from './UIToggle';
import AsciiBackground from './AsciiBackground';
import NodeInfoCard from './NodeInfoCard';

import { getOrbitalPosition } from '../utils/orbitalPosition';
import { getStaticPosition } from '../utils/staticPosition';
import { getConstellationPosition } from '../utils/constellationPosition';

// Import cursor images
import rocketCursor from '../assets/cursor32.png';
import rocketHoverCursor from '../assets/cursor_hover32.png';

// Camera scale when zoomed into a focused node.
const FOCUS_SCALE = 2.4;

const SkillTree: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<ZoomPanStageRef>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [animationTime, setAnimationTime] = useState(0);

  const {
    nodes,
    setCanvasSize,
    activeNodeId,
    hoveredNodeId,
    focusedNodeId,
    uiMode,
  } = useSkillTreeStore();

  // Latest render values, read inside the focus effect without re-subscribing it
  // to every frame (so the else-branch zoom-out doesn't fire on every tick).
  const latest = useRef({ nodes, scale, dimensions, uiMode, animationTime });
  latest.current = { nodes, scale, dimensions, uiMode, animationTime };

  // Responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });
      setCanvasSize({ width, height });
      const minDimension = Math.min(width, height);
      setScale(Math.min(1, minDimension / 460));
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [setCanvasSize]);

  // Orbital animation loop. Uses an ACCUMULATOR that only advances while nodes
  // are actually orbiting (uiMode === 'orbital', not focused), so pausing
  // during a zoom-in and resuming afterward is seamless — no angle jump.
  // Gated to 'orbital' only: 'static'/'new' layouts don't depend on
  // animationTime at all, so advancing it there would just force a full
  // re-render of every node 60x/sec for no positional benefit.
  const elapsed = useRef(0);
  useEffect(() => {
    let raf = 0;
    let last = Date.now();
    const animate = () => {
      const now = Date.now();
      if (!focusedNodeId && uiMode === 'orbital') {
        elapsed.current += now - last;
        setAnimationTime(elapsed.current);
      }
      last = now;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [focusedNodeId, uiMode]);

  // Camera: zoom into the focused node, or back out to the whole universe.
  useEffect(() => {
    if (!stageRef.current) return;
    const { nodes, scale, dimensions, uiMode, animationTime } = latest.current;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    if (focusedNodeId) {
      const node = nodes.find((n) => n.id === focusedNodeId);
      if (!node) return;
      const pos =
        uiMode === 'orbital'
          ? getOrbitalPosition(node, centerX, centerY, scale, animationTime)
          : uiMode === 'new'
          ? getConstellationPosition(node, centerX, centerY, scale)
          : getStaticPosition(node, centerX, centerY, scale);
      stageRef.current.zoomTo(pos.x, pos.y, FOCUS_SCALE, 0.9);
    } else {
      stageRef.current.zoomTo(centerX, centerY, 1, 0.9);
    }
  }, [focusedNodeId]);

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  const getCursorStyle = () => {
    if (hoveredNodeId && hoveredNodeId === activeNodeId) {
      return `url(${rocketHoverCursor}) 16 16, pointer`;
    }
    return `url(${rocketCursor}) 16 16, auto`;
  };

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#000000',
        margin: 0,
        padding: 0,
        cursor: getCursorStyle(),
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Animated ASCII nebula (behind everything) */}
      <AsciiBackground />

      {/* Solid charcoal that fades in when a node is focused. Sits between the
          nebula and the (transparent) Konva stage, so the zoomed planet reads
          as sitting on a solid color field. */}
      <AnimatePresence>
        {focusedNodeId && (
          <motion.div
            key="charcoal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: '#0d0f13',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Konva stage (planets) — above the background/charcoal */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <ZoomPanStage ref={stageRef} width={dimensions.width} height={dimensions.height}>
          <Layer>
            {uiMode === 'orbital' && !focusedNodeId && (
              <OrbitalCircles centerX={centerX} centerY={centerY} scale={scale} />
            )}

            {uiMode === 'static' && !focusedNodeId && (
              <ConnectionLines centerX={centerX} centerY={centerY} scale={scale} />
            )}

            {uiMode === 'new' && !focusedNodeId && (
              <ConstellationLines centerX={centerX} centerY={centerY} scale={scale} />
            )}

            {nodes.map((node) => (
              <SkillNode
                key={node.id}
                node={node}
                centerX={centerX}
                centerY={centerY}
                scale={scale}
                animationTime={animationTime}
              />
            ))}
          </Layer>
        </ZoomPanStage>
      </div>

      {/* Marathon-style info card for the focused node */}
      <NodeInfoCard />

      {/* UI Mode Toggle (hidden while focused) */}
      {!focusedNodeId && <UIToggle />}
    </motion.div>
  );
};

export default SkillTree;
