'use client';

import React from 'react';
import { Group, Rect, Path, Text } from 'react-konva';
import { ScadaElement } from '../../types';
import { useLayoutStore } from '../../store/useLayoutStore';
import { snapToGrid } from '../../../config';
const openFaceplate = useLayoutStore.getState().openFaceplate;

interface MotorElementProps {
  element: ScadaElement;
  mode: 'designer' | 'runtime';
  plcValue?: boolean; // Se pasará desde el runtime
}

export const MotorElement: React.FC<MotorElementProps> = ({ element, mode, plcValue }) => {
  const updateElement = useLayoutStore((state) => state.updateElement);
  const setSelection = useLayoutStore((state) => state.setSelection);
  const toggleSelection = useLayoutStore((state) => state.toggleSelection);
  const selectedIds = useLayoutStore((state) => state.selectedIds);

  const isSelected = selectedIds.includes(element.id);
  const isRunning = plcValue;

  const handleDragEnd = (e: any) => {
    updateElement(element.id, {
      x: snapToGrid(e.target.x()),
      y: snapToGrid(e.target.y()),
    });
  };

  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width || 60}
      height={element.height || 40}
      rotation={element.rotation}
      draggable={mode === 'designer'}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        if (mode === 'designer') {
          e.cancelBubble = true;
          if (e.evt.shiftKey) {
            toggleSelection(element.id);
          } else {
            setSelection([element.id]);
          }
        } else if (mode === 'runtime') {
          e.cancelBubble = true;
          // El tag es el ID que usa el faceplate
          if (element.props.tag) {
            useLayoutStore.getState().openFaceplate(element.props.tag);
          }
        }
      }}
    >
      {/* CUERPO PRINCIPAL (Del SVG original) */}
      <Rect
        width={element.width || 60}
        height={element.height || 40}
        fill={isRunning ? '#4CAF50' : '#444'}
        stroke={isSelected ? '#00e5ff' : '#222'}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={4}
        shadowBlur={isRunning ? 15 : 0}
        shadowColor="#4CAF50"
      />

      {/* EJE */}
      <Rect
        x={element.width || 60}
        y={((element.height || 40) - 10) / 2}
        width={12}
        height={10}
        fill="#888"
        cornerRadius={2}
      />

      {/*ALETAS / DISIPADORES */}
      {[0.2, 0.4, 0.6, 0.8].map((factor) => (
        <Rect
          key={factor}
          x={(element.width || 60) * factor}
          y={0}
          width={2}
          height={element.height || 40}
          fill="rgba(0,0,0,0.2)"
        />
      ))}

      {/* CAJA DE BORNES */}
      <Rect
        x={(element.width || 60) * 0.25}
        y={-8}
        width={(element.width || 60) * 0.5}
        height={10}
        fill="#333"
        stroke="#222"
      />

      {/* ETIQUETA / ID */}
      <Text
        text={element.props.name || element.id}
        x={element.props.labelOffsetX || 0}
        y={(element.props.labelOffsetY !== undefined) ? element.props.labelOffsetY : (element.height || 40) + 6}
        width={element.width || 60}
        align="center"
        fill="rgba(255,255,255,0.75)"
        fontSize={element.props.labelFontSize || 10}
        fontStyle="bold"
        draggable={mode === 'designer'}
        onDragEnd={(e) => {
          e.cancelBubble = true;
          updateElement(element.id, {
            props: {
              ...element.props,
              labelOffsetX: snapToGrid(e.target.x()),
              labelOffsetY: snapToGrid(e.target.y())
            }
          });
        }}
      />
    </Group>
  );
};
