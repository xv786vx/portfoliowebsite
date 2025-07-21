import React, { useEffect, useRef, useState } from 'react';
import { Layer } from 'react-konva';
import { motion } from 'framer-motion';
import { useSkillTreeStore } from '../store/skillTreeStore';
import SkillNode from './SkillNode';
import OrbitalCircles from './OrbitalCircles';
import ZoomPanStage, { type ZoomPanStageRef } from './ZoomPanStage';
import DetailModal from './DetailModal';
import ConnectionLines from './ConnectionLines';
import UIToggle from './UIToggle';
import backgroundImage from '../assets/nnewbackground1920_1080.png';
import { getOrbitalPosition } from '../utils/orbitalPosition';
import { getStaticPosition } from '../utils/staticPosition';

// Import cursor images (you'll need to create these)
import rocketCursor from '../assets/cursor32.png';
import rocketHoverCursor from '../assets/cursor_hover32.png';

const SkillTree: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<ZoomPanStageRef>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [animationTime, setAnimationTime] = useState(0);
  const [isCenteringWithSpring, setIsCenteringWithSpring] = useState(false);
  const [isOrbitalsPaused, setIsOrbitalsPaused] = useState(false);
  const pausedAnimationTime = useRef(0);
  
  const { 
    nodes, 
    setCanvasSize, 
    activeNodeId, 
    hoveredNodeId, 
    isDetailModalOpen, 
    detailModalNodeId, 
    closeDetailModal,
    uiMode
  } = useSkillTreeStore();
  const lastActiveNodeId = useRef<string | null>(null);
  const isInitialLoad = useRef(true);
  
  // Center the stage on the active node when it changes (instant positioning)
  useEffect(() => {
    // Skip animation on initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      lastActiveNodeId.current = activeNodeId;
      return;
    }
    
    // Only animate if the active node actually changed
    if (activeNodeId && activeNodeId !== lastActiveNodeId.current && stageRef.current) {
      const activeNode = nodes.find(node => node.id === activeNodeId);
      if (activeNode) {
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        
        // Pause orbital rotation to prevent movement during positioning (only needed in orbital mode)
        if (uiMode === 'orbital') {
          setIsOrbitalsPaused(true);
          // Capture the current animation time for paused state
          pausedAnimationTime.current = animationTime;
        }
        setIsCenteringWithSpring(true);
        
        // Get the current position based on UI mode
        const currentPosition = uiMode === 'orbital' 
          ? getOrbitalPosition(activeNode, centerX, centerY, scale, pausedAnimationTime.current)
          : getStaticPosition(activeNode, centerX, centerY, scale);
        
        // Instantly center on the node (duration = 0)
        stageRef.current.immediateCenter(currentPosition.x, currentPosition.y);
        
        // Resume orbital motion after a brief delay to ensure positioning is complete
        // (only needed in orbital mode)
        if (uiMode === 'orbital') {
          setTimeout(() => {
            setIsOrbitalsPaused(false);
            setIsCenteringWithSpring(false);
          }, 50); // Very brief delay for clean transition
        } else {
          // In static mode, just finish the centering immediately
          setIsOrbitalsPaused(false);
          setIsCenteringWithSpring(false);
        }
      }
    }
    
    lastActiveNodeId.current = activeNodeId;
  }, [activeNodeId, nodes, dimensions, scale, animationTime, uiMode]);

  // Continuously track the active node's position as it rotates (smooth following)
  useEffect(() => {
    // Don't track during centering, if orbitals are paused, if no active node, or no stage
    if (isCenteringWithSpring || isOrbitalsPaused || !activeNodeId || !stageRef.current) return;
    
    // In static mode, don't continuously track since nodes don't move
    if (uiMode === 'static') return;
    
    const activeNode = nodes.find(node => node.id === activeNodeId);
    if (!activeNode) return;
    
    // Only track moving nodes (level 1 and 2), center node stays fixed
    if (activeNode.level === 0) return;
    
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    // Get the current position based on UI mode (for smooth following)
    const currentPosition = uiMode === 'orbital' 
      ? getOrbitalPosition(activeNode, centerX, centerY, scale, animationTime)
      : getStaticPosition(activeNode, centerX, centerY, scale);
    
    // Calculate the new stage position for continuous tracking
    const newPos = {
      x: centerX - currentPosition.x,
      y: centerY - currentPosition.y,
    };
    
    // Update the Konva stage directly for smooth real-time tracking
    const stage = stageRef.current.getStage();
    if (stage) {
      stage.position(newPos);
      stage.batchDraw();
    }
    
    // Don't update the spring value during tracking to avoid conflicts
  }, [animationTime, activeNodeId, nodes, dimensions, scale, isCenteringWithSpring, isOrbitalsPaused, uiMode]); // Update every frame
  
  // Handle responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        setDimensions({ width, height });
        setCanvasSize({ width, height });
        
        // Calculate scale based on available space
        const minDimension = Math.min(width, height);
        setScale(Math.min(1, minDimension / 600));
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [setCanvasSize]);

  // Animation loop for orbital rotation
  useEffect(() => {
    if (uiMode === 'static') return; // Don't animate in static mode
    
    const animate = () => {
      setAnimationTime(Date.now());
      requestAnimationFrame(animate);
    };
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [uiMode]);

  // Handle UI mode changes - re-center active node when switching modes
  const prevUIMode = useRef(uiMode);
  useEffect(() => {
    if (prevUIMode.current !== uiMode && activeNodeId && stageRef.current) {
      const activeNode = nodes.find(node => node.id === activeNodeId);
      if (activeNode) {
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        
        // Get the current position in the new UI mode
        const currentPosition = uiMode === 'orbital' 
          ? getOrbitalPosition(activeNode, centerX, centerY, scale, animationTime)
          : getStaticPosition(activeNode, centerX, centerY, scale);
        
        // Re-center the stage on the active node in its new position
        stageRef.current.centerOn(currentPosition.x, currentPosition.y);
      }
      prevUIMode.current = uiMode;
    }
  }, [uiMode, activeNodeId, nodes, dimensions.width, dimensions.height, scale, animationTime]);
  
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  
  // Determine cursor style based on hover state
  const getCursorStyle = () => {
    // If hovering over the currently active node, show special cursor
    if (hoveredNodeId && hoveredNodeId === activeNodeId) {
      return `url(${rocketHoverCursor}) 16 16, pointer`; // 16,16 is hotspot center for 32x32 image
    }
    // Default rocket cursor
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
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover', // Cover the entire viewport
        backgroundPosition: 'center center', // Center the image
        backgroundRepeat: 'no-repeat', // Don't repeat the image
        imageRendering: 'pixelated', // Maintain pixel art quality
        margin: 0,
        padding: 0,
        cursor: getCursorStyle(), // Apply custom cursor
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <ZoomPanStage ref={stageRef} width={dimensions.width} height={dimensions.height}>
        <Layer>
          {/* Conditional rendering based on UI mode */}
          {uiMode === 'orbital' && (
            <OrbitalCircles 
              centerX={centerX} 
              centerY={centerY} 
              scale={scale}
            />
          )}
          
          {uiMode === 'static' && (
            <ConnectionLines
              centerX={centerX}
              centerY={centerY}
              scale={scale}
            />
          )}
          
          {/* Skill nodes */}
          {nodes.map((node) => (
            <SkillNode
              key={node.id}
              node={node}
              centerX={centerX}
              centerY={centerY}
              scale={scale}
              animationTime={isOrbitalsPaused ? pausedAnimationTime.current : animationTime}
            />
          ))}
        </Layer>
      </ZoomPanStage>
      
      {/* Overlay UI for active node details - hide when modal is open */}
      {!isDetailModalOpen && <ActiveNodePanel />}

      {/* UI Mode Toggle */}
      <UIToggle />

      {/* Detail Modal */}
      <DetailModal
        isOpen={isDetailModalOpen}
        nodeData={detailModalNodeId ? nodes.find(n => n.id === detailModalNodeId)?.portfolioData || null : null}
        onClose={closeDetailModal}
      />
    </motion.div>
  );
};

// Component for displaying active node information
const ActiveNodePanel: React.FC = () => {
  const { nodes, activeNodeId } = useSkillTreeStore();
  const activeNode = nodes.find(node => node.id === activeNodeId);
  
  if (!activeNode) return null;
  
  // Position the panel within the canvas area, not outside it
  const panelStyle = {
    position: 'absolute' as const,
    top: '20px',  // 20px from top of canvas
    left: '20px', // 20px from left of canvas
    zIndex: 1000, // Above the canvas
  };
  
  return (
    <motion.div
      style={panelStyle}
      className="p-6 text-green-400 shadow-2xl font-pixelify"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-2xl font-medium text-white mb-2 tracking-wider uppercase underline underline-offset-4">
        {activeNode.label}
      </h3>
      {activeNode.description && (
        <p className="text-green-300 text-md mb-4 leading-relaxed">
          {activeNode.description}
        </p>
      )}
      <div className="flex items-center gap-3 mt-4">
        <div 
          className="w-4 h-4 border border-green-500"
          style={{ 
            backgroundColor: activeNode.strokeColor || activeNode.color,
            imageRendering: 'pixelated',
            borderRadius: '0px'
          }}
        />
        <span className="text-xs text-green-500 uppercase tracking-wide">
          LEVEL {activeNode.level} NODE
        </span>
      </div>
    </motion.div>
  );
};

export default SkillTree;
