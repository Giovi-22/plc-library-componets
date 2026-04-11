'use client';

import React from 'react';
import { Line, Group } from 'react-konva';
import { ScadaElement } from '../../types';
import { useLayoutStore } from '../../store/useLayoutStore';
import { useFlowAnimation } from '../../hooks/useFlowAnimation';
import { snapToGrid } from '../../../config';

interface PipeProps {
  element: ScadaElement;
  mode: 'designer' | 'runtime';
  isFlowing?: boolean;
}

export const Pipe: React.FC<PipeProps> = ({ element, mode, isFlowing = false }) => {
  const updateElement = useLayoutStore((state) => state.updateElement);
  const setSelection = useLayoutStore((state) => state.setSelection);
  const toggleSelection = useLayoutStore((state) => state.toggleSelection);
  const selectedIds = useLayoutStore((state) => state.selectedIds);
  const isSelected = selectedIds.includes(element.id);

  const { points = [], props } = element;

  const handleDblClick = (e: any) => {
    if (mode !== 'designer') return;
    e.cancelBubble = true;

    const stage = e.target.getStage();
    const pointer = stage.getRelativePointerPosition();
    
    const clickedX = snapToGrid(pointer.x);
    const clickedY = snapToGrid(pointer.y);

    const newPoints = [...points];
    
    // Insertar en el segmento más cercano
    let insertIndex = newPoints.length;
    let minDistance = 1000;

    for (let i = 0; i < newPoints.length - 2; i += 2) {
      const dist = distToSegment(
        clickedX, clickedY,
        newPoints[i], newPoints[i+1],
        newPoints[i+2], newPoints[i+3]
      );
      if (dist < minDistance) {
        minDistance = dist;
        insertIndex = i + 2;
      }
    }

    newPoints.splice(insertIndex, 0, clickedX, clickedY);
    updateElement(element.id, { points: newPoints });
  };
  const thickness = props.thickness || 8;
  const color = props.color || '#3498db';
  const dashOffset = useFlowAnimation(isFlowing, 3);

  if (points.length < 4) return null;

  return (
    <Group 
      x={element.x} 
      y={element.y}
      id={element.id}
      onClick={(e) => {
        if (mode === 'designer') {
          e.cancelBubble = true;
          if (e.evt.shiftKey) {
            toggleSelection(element.id);
          } else {
            setSelection([element.id]);
          }
        }
      }}
      onDblClick={handleDblClick}
    >
      {/* 1. SOMBRA / VOLUMEN (Línea base más gruesa y oscura) */}
      <Line
        points={points}
        stroke="#000"
        strokeWidth={thickness + 4}
        lineCap="round"
        lineJoin="round"
        opacity={0.3}
      />

      {/* 2. LÍNEA PRINCIPAL */}
      <Line
        points={points}
        stroke={isFlowing ? '#2ecc71' : color}
        strokeWidth={thickness}
        lineCap="round"
        lineJoin="round"
        // Efecto punteado animado si está fluyendo
        dash={isFlowing ? [20, 15] : []}
        dashOffset={dashOffset}
      />

      {/* 3. BRILLO CENTRAL (Opcional, para un look más industrial) */}
      <Line
        points={points}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={thickness / 3}
        lineCap="round"
        lineJoin="round"
      />
    </Group>
  );
};

// --- UTILS ---
function distToSegment(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
  const l2 = (x2-x1)**2 + (y2-y1)**2;
  if (l2 === 0) return Math.sqrt((x-x1)**2 + (y-y1)**2);
  let t = ((x-x1)*(x2-x1) + (y-y1)*(y2-y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt((x - (x1 + t*(x2-x1)))**2 + (y - (y1 + t*(y2-y1)))**2);
}
