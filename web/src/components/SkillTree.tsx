import React, { useEffect, useRef, useState } from 'react';
import { Layer } from 'react-konva';
import { motion } from 'framer-motion';
import { useSkillTreeStore } from '../store/skillTreeStore';
import SkillNode from './SkillNode';
import ConnectionLines from './ConnectionLines';
import ZoomPanStage, { type ZoomPanStageRef } from './ZoomPanStage';

const SkillTree: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<ZoomPanStageRef>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  
  const { nodes, setCanvasSize, activeNodeId } = useSkillTreeStore();
  const lastActiveNodeId = useRef<string | null>(null);
  const isInitialLoad = useRef(true);
  
  // Center the stage on the active node when it changes
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
        const nodeX = centerX + activeNode.position.x * scale;
        const nodeY = centerY + activeNode.position.y * scale;
        
        // Center immediately - no delay
        stageRef.current.centerOn(nodeX, nodeY);
      }
    }
    
    lastActiveNodeId.current = activeNodeId;
  }, [activeNodeId, nodes, dimensions, scale]);
  
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
  
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  
  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen bg-black relative overflow-hidden"
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
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <ZoomPanStage ref={stageRef} width={dimensions.width} height={dimensions.height}>
        <Layer>
          {/* Connection lines */}
          <ConnectionLines 
            centerX={centerX} 
            centerY={centerY} 
            scale={scale} 
          />
          
          {/* Skill nodes */}
          {nodes.map((node) => (
            <SkillNode
              key={node.id}
              node={node}
              centerX={centerX}
              centerY={centerY}
              scale={scale}
            />
          ))}
        </Layer>
      </ZoomPanStage>
      
      {/* Overlay UI for active node details */}
      <ActiveNodePanel />
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
      className="bg-red-500 border-4 border-yellow-400 p-6 rounded-xl text-white shadow-2xl"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-2xl font-bold text-white mb-4 font-ptsans">{activeNode.label}</h3>
      {activeNode.description && (
        <p className="text-gray-300 text-base mb-4">{activeNode.description}</p>
      )}
      <div className="flex items-center gap-3 mt-4">
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: activeNode.strokeColor || activeNode.color }}
        />
        <span className="text-sm text-gray-400">
          Level {activeNode.level} Node
        </span>
      </div>
    </motion.div>
  );
};

export default SkillTree;
