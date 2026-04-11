'use client';

import { useState } from 'react';
import Konva from 'konva';

export const useStage = () => {
  const [stage, setStage] = useState<{ scale: number; x: number; y: number }>({
    scale: 1,
    x: 0,
    y: 0,
  });

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stageInst = e.target.getStage();
    const oldScale = stageInst.scaleX();
    
    const pointer = stageInst.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stageInst.x()) / oldScale,
      y: (pointer.y - stageInst.y()) / oldScale,
    };

    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Limitar zoom
    if (newScale < 0.1 || newScale > 10) return;

    setStage({
      scale: newScale,
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  return {
    stage,
    handleWheel,
  };
};
