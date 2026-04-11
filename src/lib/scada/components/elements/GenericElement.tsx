'use client';

import React from 'react';
import { Group, Rect, Path, Text, Line } from 'react-konva';
import { ScadaElement } from '../../types';
import { useLayoutStore } from '../../store/useLayoutStore';

interface GenericElementProps {
  element: ScadaElement;
  mode: 'designer' | 'runtime';
  plcValue?: boolean;
}

export const GenericElement: React.FC<GenericElementProps> = ({ element, mode, plcValue }) => {
  const updateElement = useLayoutStore((state) => state.updateElement);
  const selectElement = useLayoutStore((state) => state.selectElement);
  const selectedId = useLayoutStore((state) => state.selectedId);

  const isSelected = selectedId === element.id;

  const handleDragEnd = (e: any) => {
    updateElement(element.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  // Renderizado según el tipo
  const renderShape = () => {
    switch (element.type) {
      case 'valve':
        return (
          <Group>
            <Path
              data="M0,0 L40,30 L0,30 L40,0 Z"
              fill={plcValue ? '#4CAF50' : '#555'}
              stroke={isSelected ? '#00e5ff' : '#222'}
              strokeWidth={isSelected ? 2 : 1}
              shadowBlur={plcValue ? 10 : 0}
              shadowColor="#4CAF50"
            />
            <Rect x={18} y={5} width={4} height={20} fill="#333" />
            <Rect x={10} y={0} width={20} height={5} fill="#666" cornerRadius={2} />
          </Group>
        );
      
      case 'pipe':
        return (
          <Line
            points={[0, 0, element.width || 100, 0]}
            stroke="#2c3e50"
            strokeWidth={element.height || 6}
            lineCap="round"
            lineJoin="round"
            shadowBlur={isSelected ? 5 : 0}
            shadowColor="#00e5ff"
          />
        );
      
      case 'sensor':
        return (
          <Group>
            <Rect
              width={element.width || 30}
              height={element.height || 30}
              fill={plcValue ? '#4CAF50' : '#222'}
              stroke={isSelected ? '#00e5ff' : '#444'}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={(element.width || 30) / 2}
            />
            <Text
              text="S"
              width={element.width || 30}
              height={element.height || 30}
              align="center"
              verticalAlign="middle"
              fill="var(--accent)"
              fontSize={(element.width || 30) * 0.5}
              fontStyle="bold"
            />
          </Group>
        );
      
      case 'silo': {
        const sw = element.width || 100;
        const sh = element.height || 150;
        return (
          <Group>
            {/* Cuerpo cilíndrico */}
            <Rect width={sw} height={sh * 0.72} fill="#2c3e50" stroke="#7f8c8d" strokeWidth={1.5} cornerRadius={[4, 4, 0, 0]} />
            {/* Embudo cónico */}
            <Path
              data={`M0,${sh * 0.72} L${sw},${sh * 0.72} L${sw * 0.58},${sh} L${sw * 0.42},${sh} Z`}
              fill="#34495e"
              stroke="#7f8c8d"
              strokeWidth={1.5}
            />
            {/* Faja indicador nivel */}
            <Rect x={sw - 6} y={4} width={4} height={sh * 0.65} fill="#1a2530" cornerRadius={2} />
            <Rect x={sw - 6} y={sh * 0.65 * 0.4 + 4} width={4} height={sh * 0.65 * 0.6} fill={plcValue ? '#4CAF50' : '#2980b9'} cornerRadius={2} />
            {/* Tapa superior */}
            <Rect x={-4} y={-4} width={sw + 8} height={10} fill="#445566" stroke="#7f8c8d" strokeWidth={1} cornerRadius={3} />
            {/* Selección/highlight */}
            {isSelected && <Rect width={sw} height={sh * 0.72} stroke="#00e5ff" strokeWidth={2} fill="transparent" cornerRadius={[4, 4, 0, 0]} />}
          </Group>
        );
      }

      case 'tank': {
        const tw = element.width || 120;
        const th = element.height || 120;
        const r = Math.min(tw, th) / 2;
        return (
          <Group>
            {/* Cuerpo ovalado simulado con Rect + caps */}
            <Rect x={r * 0.3} y={0} width={tw - r * 0.6} height={th} fill="#1e3040" stroke="#4a90a4" strokeWidth={1.5} />
            {/* Tapa izquierda (elipse simulada) */}
            <Path
              data={`M${r * 0.3},0 Q0,${th / 2} ${r * 0.3},${th} Z`}
              fill="#22384d"
              stroke="#4a90a4"
              strokeWidth={1}
            />
            {/* Tapa derecha */}
            <Path
              data={`M${tw - r * 0.3},0 Q${tw},${th / 2} ${tw - r * 0.3},${th} Z`}
              fill="#22384d"
              stroke="#4a90a4"
              strokeWidth={1}
            />
            {/* Nivel de líquido */}
            <Rect
              x={r * 0.3 + 2}
              y={th * 0.35}
              width={tw - r * 0.6 - 4}
              height={th * 0.6}
              fill={plcValue ? 'rgba(52,152,219,0.5)' : 'rgba(44,62,80,0.5)'}
            />
            {/* Boca superior */}
            <Rect x={tw / 2 - 6} y={-8} width={12} height={12} fill="#2c4a5a" stroke="#4a90a4" strokeWidth={1} cornerRadius={2} />
            {/* Patas */}
            <Rect x={tw * 0.2} y={th} width={8} height={12} fill="#2c3e50" />
            <Rect x={tw * 0.75} y={th} width={8} height={12} fill="#2c3e50" />
            {isSelected && <Rect x={r * 0.3} y={0} width={tw - r * 0.6} height={th} stroke="#00e5ff" strokeWidth={2} fill="transparent" />}
          </Group>
        );
      }

      case 'conveyor': {
        const cw = element.width || 200;
        const ch = element.height || 30;
        const rollerCount = Math.floor(cw / 24);
        return (
          <Group>
            {/* Banda superior */}
            <Rect y={0} width={cw} height={ch * 0.3} fill={plcValue ? '#27ae60' : '#555'} cornerRadius={[4, 4, 0, 0]} />
            {/* Estructura de la cinta */}
            <Rect y={ch * 0.3} width={cw} height={ch * 0.4} fill="#333" />
            {/* Banda inferior */}
            <Rect y={ch * 0.7} width={cw} height={ch * 0.3} fill="#444" cornerRadius={[0, 0, 4, 4]} />
            {/* Rodillos */}
            {Array.from({ length: rollerCount + 1 }).map((_, i) => (
              <Rect
                key={i}
                x={i * (cw / rollerCount) - 3}
                y={ch * 0.2}
                width={6}
                height={ch * 0.6}
                fill="#666"
                cornerRadius={3}
              />
            ))}
            {/* Poleas en extremos */}
            <Rect x={-5} y={0} width={10} height={ch} fill="#555" cornerRadius={5} />
            <Rect x={cw - 5} y={0} width={10} height={ch} fill="#555" cornerRadius={5} />
            {isSelected && <Rect width={cw} height={ch} stroke="#00e5ff" strokeWidth={2} fill="transparent" cornerRadius={4} />}
          </Group>
        );
      }

      case 'redler': {
        const rw = element.width || 200;
        const rh = element.height || 40;
        const chainSpacing = 28;
        const chainCount = Math.floor(rw / chainSpacing);
        return (
          <Group>
            {/* Carcasa exterior */}
            <Rect width={rw} height={rh} fill="#1e2830" stroke="#4a5568" strokeWidth={2} cornerRadius={4} />
            {/* Canal interior */}
            <Rect x={4} y={4} width={rw - 8} height={rh - 8} fill="#161e26" cornerRadius={2} />
            {/* Cadena transportadora (eslabones) */}
            {Array.from({ length: chainCount }).map((_, i) => (
              <Group key={i} x={i * chainSpacing + 8}>
                {/* Eslabón horizontal */}
                <Rect y={rh / 2 - 3} width={16} height={6} fill={plcValue ? '#2ecc71' : '#3a4555'} cornerRadius={2} />
                {/* Rasqueta */}
                <Rect x={6} y={rh * 0.15} width={4} height={rh * 0.7} fill={plcValue ? '#27ae60' : '#2c3a45'} cornerRadius={1} />
              </Group>
            ))}
            {/* Tapas laterales */}
            <Rect x={0} y={0} width={8} height={rh} fill="#2c3a45" stroke="#4a5568" strokeWidth={1} cornerRadius={[4, 0, 0, 4]} />
            <Rect x={rw - 8} y={0} width={8} height={rh} fill="#2c3a45" stroke="#4a5568" strokeWidth={1} cornerRadius={[0, 4, 4, 0]} />
            {isSelected && <Rect width={rw} height={rh} stroke="#00e5ff" strokeWidth={2} fill="transparent" cornerRadius={4} />}
          </Group>
        );
      }

      default:
        return <Rect width={20} height={20} fill="red" />;
    }
  };

  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width || 40}
      height={element.height || 40}
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
      {renderShape()}
      <Text
        text={element.props.name || element.id}
        y={element.type === 'pipe' ? 10 : 35}
        width={element.type === 'valve' ? 40 : 30}
        align="center"
        fill="rgba(255,255,255,0.5)"
        fontSize={8}
      />
    </Group>
  );
};
