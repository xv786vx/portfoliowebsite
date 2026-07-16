import React, { useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Stage } from 'react-konva';
import Konva from 'konva';

interface ZoomPanStageProps {
  width: number;
  height: number;
  children: React.ReactNode;
  onScaleChange?: (scale: number) => void;
  /** When false, the stage is fully locked: no drag/pan and no wheel zoom. */
  interactive?: boolean;
  /** Fired when the user clicks empty canvas — not a node body or its label.
   *  A pan that ends in empty space does not count. */
  onBackgroundClick?: () => void;
}

/** Pointer travel (px) still treated as a click rather than a pan. */
const CLICK_SLOP = 5;

export interface ZoomPanStageRef {
  centerOn: (x: number, y: number) => void;
  getStage: () => Konva.Stage | null;
  immediateCenter: (x: number, y: number) => void;
  zoomTo: (
    x: number,
    y: number,
    scale: number,
    duration?: number,
    screenX?: number,
    screenY?: number
  ) => void;
}

const ZoomPanStage = forwardRef<ZoomPanStageRef, ZoomPanStageProps>(({ width, height, children, interactive = true, onBackgroundClick }, ref) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const currentTweenRef = useRef<Konva.Tween | null>(null);
  // Where the pointer went down, and whether it landed on empty canvas.
  const pointerDownRef = useRef<{ x: number; y: number; onEmpty: boolean } | null>(null);
  
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
    immediateCenter: (nodeX: number, nodeY: number) => {
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
      
      // Create a quick, smooth animation (shorter duration than centerOn)
      currentTweenRef.current = new Konva.Tween({
        node: stage,
        x: newPos.x,
        y: newPos.y,
        duration: 0, // Much faster to reduce flash
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
    getStage: () => stageRef.current,
    zoomTo: (
      nodeX: number,
      nodeY: number,
      scale: number,
      duration = 0.8,
      screenX = width / 2,
      screenY = height / 2
    ) => {
      const stage = stageRef.current;
      if (!stage) return;

      // Stop any existing animation
      if (currentTweenRef.current) {
        currentTweenRef.current.destroy();
        currentTweenRef.current = null;
      }

      // Position that lands (nodeX, nodeY) at the screen point (screenX, screenY)
      // at the TARGET scale (defaults to screen center).
      const newPos = {
        x: screenX - nodeX * scale,
        y: screenY - nodeY * scale,
      };

      currentTweenRef.current = new Konva.Tween({
        node: stage,
        x: newPos.x,
        y: newPos.y,
        scaleX: scale,
        scaleY: scale,
        duration,
        easing: Konva.Easings.EaseInOut,
        onUpdate: () => {
          setStagePos({ x: stage.x(), y: stage.y() });
          setStageScale(stage.scaleX());
        },
        onFinish: () => {
          currentTweenRef.current = null;
          setStagePos({ x: stage.x(), y: stage.y() });
          setStageScale(stage.scaleX());
        },
      });

      currentTweenRef.current.play();
    },
  }), [width, height, stageScale]);
  
  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    if (!interactive) return; // Locked: no wheel zoom
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
    const newScale = Math.max(0.5, Math.min(3, oldScale + direction * 0.1));
    
    setStageScale(newScale);
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    
    setStagePos(newPos);
  }, [interactive]);

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

  // A click on empty canvas dismisses the focused node. Konva reports the Stage
  // itself as the target only when nothing was hit, so node bodies and their
  // labels — which carry their own handlers — never reach here. Tracked across
  // down/up rather than via onClick so that panning the stage and releasing over
  // empty space doesn't read as a click.
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    pointerDownRef.current = pointer
      ? { x: pointer.x, y: pointer.y, onEmpty: e.target === stage }
      : null;
  }, []);

  const handleMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const down = pointerDownRef.current;
    pointerDownRef.current = null;

    if (!down || !down.onEmpty || !onBackgroundClick) return;

    const stage = stageRef.current;
    if (e.target !== stage) return; // released over a node

    const pointer = stage?.getPointerPosition();
    if (!pointer) return;

    if (Math.hypot(pointer.x - down.x, pointer.y - down.y) <= CLICK_SLOP) {
      onBackgroundClick();
    }
  }, [onBackgroundClick]);

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
      draggable={interactive}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      // When locked, let native touch scrolling pass through the canvas.
      preventDefault={interactive}
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
