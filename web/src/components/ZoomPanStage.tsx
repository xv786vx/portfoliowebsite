import React, { useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Stage } from 'react-konva';
import Konva from 'konva';

interface ZoomPanStageProps {
  width: number;
  height: number;
  children: React.ReactNode;
  onScaleChange?: (scale: number) => void;
}

export interface ZoomPanStageRef {
  centerOn: (x: number, y: number) => void;
}

const ZoomPanStage = forwardRef<ZoomPanStageRef, ZoomPanStageProps>(({ width, height, children }, ref) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const currentTweenRef = useRef<Konva.Tween | null>(null);
  
  // Expose centerOn method to parent
  useImperativeHandle(ref, () => ({
    centerOn: (nodeX: number, nodeY: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      
      // Stop any existing animation
      if (currentTweenRef.current) {
        currentTweenRef.current.destroy();
        currentTweenRef.current = null;
      }
      
      // Calculate the position needed to center the node
      const newPos = {
        x: width / 2 - nodeX * stageScale,
        y: height / 2 - nodeY * stageScale,
      };
      
      // Create and start the animation
      currentTweenRef.current = new Konva.Tween({
        node: stage,
        x: newPos.x,
        y: newPos.y,
        duration: 1,
        easing: Konva.Easings.EaseInOut,
        onUpdate: () => {
          setStagePos({ x: stage.x(), y: stage.y() });
        },
        onFinish: () => {
          currentTweenRef.current = null;
          setStagePos({ x: stage.x(), y: stage.y() });
        },
      });
      
      currentTweenRef.current.play();
    },
  }), [width, height, stageScale]);
  
  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    if (currentTweenRef.current) return; // Prevent zoom during animation
    
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    if (!pointer) return;
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.max(0.5, Math.min(2, oldScale + direction * 0.1));
    
    setStageScale(newScale);
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    
    setStagePos(newPos);
  }, []);

  const handleDragStart = useCallback(() => {
    // Allow dragging to interrupt animation
    if (currentTweenRef.current) {
      currentTweenRef.current.destroy();
      currentTweenRef.current = null;
    }
  }, []);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (!currentTweenRef.current) {
      setStagePos({ x: e.target.x(), y: e.target.y() });
    }
  }, []);
  
  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stagePos.x}
      y={stagePos.y}
      onWheel={handleWheel}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      // Pixel art specific settings
      imageSmoothingEnabled={false}
      pixelRatio={1}
      // Force canvas to use nearest neighbor
      listening={true}
    >
      {children}
    </Stage>
  );
});

export default ZoomPanStage;
