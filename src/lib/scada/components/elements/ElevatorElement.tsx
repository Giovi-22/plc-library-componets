'use client';

import React, { useRef, useEffect } from 'react';
import { Group, Rect, Path, Line, Text } from 'react-konva';
import { ScadaElement } from '../../types';
import { useLayoutStore } from '../../store/useLayoutStore';
import Konva from 'konva';

interface ElevatorElementProps {
  element: ScadaElement;
  mode: 'designer' | 'runtime';
  plcValue?: boolean;
}

export const ElevatorElement: React.FC<ElevatorElementProps> = ({ element, mode, plcValue }) => {
  const updateElement = useLayoutStore((state) => state.updateElement);
  const selectElement = useLayoutStore((state) => state.selectElement);
  const selectedId = useLayoutStore((state) => state.selectedId);
  const isSelected = selectedId === element.id;
  const isRunning = !!plcValue;

  const width = element.width || 60;
  const height = element.height || 200;
  const bucketGroupRef = useRef<Konva.Group>(null);
  const animRef = useRef<Konva.Animation | null>(null);

  // Animación de cangilones - lenta
  useEffect(() => {
    if (isRunning && bucketGroupRef.current) {
      const layer = bucketGroupRef.current.getLayer();
      animRef.current = new Konva.Animation((frame) => {
        if (!bucketGroupRef.current || !frame) return;
        // speed=25 → ciclo de 40px cada ~1.6 segundos (lento)
        const offset = (frame.time * 25 / 1000) % 40;
        bucketGroupRef.current.y(offset);
      }, layer);
      animRef.current.start();
    } else {
      animRef.current?.stop();
      animRef.current = null;
      bucketGroupRef.current?.y(0);
    }
    return () => {
      animRef.current?.stop();
    };
  }, [isRunning]);

  const handleDragEnd = (e: any) => {
    updateElement(element.id, { x: e.target.x(), y: e.target.y() });
  };

  const bucketCount = Math.ceil(height / 40) + 2;

  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      width={width}
      height={height}
      rotation={element.rotation}
      draggable={mode === 'designer'}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        if (mode === 'designer') {
          e.cancelBubble = true;
          selectElement(element.id);
        }
      }}
    >
      {/* ESTRUCTURA PRINCIPAL */}
      <Rect
        width={width}
        height={height}
        fill="#1a1a1a"
        stroke={isSelected ? '#00e5ff' : '#3a3a3a'}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={4}
        shadowBlur={isSelected ? 8 : 0}
        shadowColor="#00e5ff"
      />

      {/* CABEZAL SUPERIOR */}
      <Rect
        x={-6} y={-6}
        width={width + 12}
        height={26}
        fill="#252525"
        stroke="#555"
        strokeWidth={1}
        cornerRadius={4}
      />
      {/* Polea superior */}
      <Rect x={width / 2 - 8} y={0} width={16} height={14} fill="#555" cornerRadius={7} />

      {/* PIE INFERIOR */}
      <Rect
        x={-6} y={height - 20}
        width={width + 12}
        height={26}
        fill="#252525"
        stroke="#555"
        strokeWidth={1}
        cornerRadius={4}
      />
      {/* Polea inferior */}
      <Rect x={width / 2 - 8} y={height - 14} width={16} height={14} fill="#555" cornerRadius={7} />

      {/* CADENAS (Líneas laterales) */}
      <Line points={[width * 0.28, 20, width * 0.28, height - 20]} stroke="#2a2a2a" strokeWidth={3} />
      <Line points={[width * 0.72, 20, width * 0.72, height - 20]} stroke="#2a2a2a" strokeWidth={3} />

      {/* CANGILONES ANIMADOS */}
      <Group clipX={1} clipY={20} clipWidth={width - 2} clipHeight={height - 38}>
        <Group ref={bucketGroupRef}>
          {Array.from({ length: bucketCount }).map((_, i) => (
            <React.Fragment key={i}>
              {/* Cangilón subiendo (lado izquierdo) – volcado hacia adentro */}
              <Path
                data={`M${width * 0.15},${i * 40 - 30} L${width * 0.4},${i * 40 - 30} L${width * 0.38},${i * 40 - 18} L${width * 0.17},${i * 40 - 18} Z`}
                fill={isRunning ? '#0077aa' : '#333'}
                stroke={isRunning ? '#00bbff' : '#444'}
                strokeWidth={1}
              />
              {/* Cangilón bajando (lado derecho) – volcado al revés */}
              <Path
                data={`M${width * 0.6},${i * 40 - 10} L${width * 0.85},${i * 40 - 10} L${width * 0.83},${i * 40 + 2} L${width * 0.62},${i * 40 + 2} Z`}
                fill={isRunning ? '#00334d' : '#2a2a2a'}
                stroke={isRunning ? '#005577' : '#333'}
                strokeWidth={1}
                opacity={0.7}
              />
            </React.Fragment>
          ))}
        </Group>
      </Group>

      {/* INDICADOR ESTADO RUNNING */}
      {isRunning && (
        <Rect
          x={width - 8} y={8}
          width={6} height={6}
          fill="#00ff88"
          cornerRadius={3}
          shadowBlur={6}
          shadowColor="#00ff88"
        />
      )}

      {/* ETIQUETA */}
      <Text
        text={element.props.name || element.id}
        y={height + 6}
        width={width}
        align="center"
        fill="rgba(255,255,255,0.7)"
        fontSize={10}
        fontStyle="bold"
      />
    </Group>
  );
};
