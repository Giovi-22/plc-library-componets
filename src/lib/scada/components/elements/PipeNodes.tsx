'use client';

import React from 'react';
import { Circle } from 'react-konva';
import { ScadaElement } from '../../types';
import { useLayoutStore } from '../../store/useLayoutStore';
import { snapToGrid } from '../../../config';

interface PipeNodesProps {
  element: ScadaElement;
}

export const PipeNodes: React.FC<PipeNodesProps> = ({ element }) => {
  const updateElement = useLayoutStore((state) => state.updateElement);
  const points = element.points || [];

  const handleDragPoint = (index: number, e: any) => {
    const newPoints = [...points];
    let newX = snapToGrid(e.target.x());
    let newY = snapToGrid(e.target.y());


    newPoints[index * 2] = newX;
    newPoints[index * 2 + 1] = newY;
    
    updateElement(element.id, { points: newPoints });
  };

  const handleRemovePoint = (index: number, e: any) => {
    if (e) e.evt.preventDefault();
    if (points.length <= 4) return; // Mantener al menos 2 puntos

    const newPoints = [...points];
    newPoints.splice(index * 2, 2);
    updateElement(element.id, { points: newPoints });
  };

  // Convertimos el array plano [x1, y1, x2, y2] en una lista de objetos coordinados
  const markers = [];
  for (let i = 0; i < points.length; i += 2) {
    markers.push({ x: points[i], y: points[i + 1], index: i / 2 });
  }

  return (
    <>
      {markers.map((m) => (
        <Circle
          key={`${element.id}-node-${m.index}`}
          x={m.x}
          y={m.y}
          radius={6}
          fill="#00e5ff"
          stroke="white"
          strokeWidth={2}
          draggable
          onDragMove={(e) => handleDragPoint(m.index, e)}
          onContextMenu={(e) => handleRemovePoint(m.index, e)}
          onMouseEnter={(e) => {
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = 'move';
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = 'default';
          }}
        />
      ))}
    </>
  );
};
