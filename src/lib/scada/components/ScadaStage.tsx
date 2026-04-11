'use client';

import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import Konva from 'konva';
import { useStage } from '../hooks/useStage';
import { usePLCData } from '../hooks/usePLCData';
import { useLayoutStore } from '../store/useLayoutStore';
import { GRID_SIZE, snapToGrid } from '../../config';
import { MotorElement } from './elements/MotorElement';
import { GenericElement } from './elements/GenericElement';
import { ElevatorElement } from './elements/ElevatorElement';
import { PipeLayer } from './PipeLayer';

interface ScadaStageProps {
  mode: 'designer' | 'runtime';
}

export const ScadaStage: React.FC<ScadaStageProps> = ({ mode }) => {
  const { stage, handleWheel } = useStage();
  const { data: plcData } = usePLCData();
  const elements = useLayoutStore((state) => state.elements);
  const setSelection = useLayoutStore((state) => state.setSelection);
  const clearSelection = useLayoutStore((state) => state.clearSelection);
  const selectedIds = useLayoutStore((state) => state.selectedIds);
  const updateElement = useLayoutStore((state) => state.updateElement);

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const [selectionRect, setSelectionRect] = React.useState<{x: number, y: number, width: number, height: number} | null>(null);
  const selectionStartPos = useRef<{x: number, y: number} | null>(null);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (mode !== 'designer') return;
    if (e.target !== e.target.getStage()) {
      return;
    }
    if (!e.evt.shiftKey) {
      clearSelection();
    }
    const pos = e.target.getStage()?.getRelativePointerPosition();
    if (pos) {
      selectionStartPos.current = pos;
      setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (mode !== 'designer' || !selectionStartPos.current) return;
    const pos = e.target.getStage()?.getRelativePointerPosition();
    if (pos) {
      setSelectionRect({
        x: Math.min(selectionStartPos.current.x, pos.x),
        y: Math.min(selectionStartPos.current.y, pos.y),
        width: Math.abs(pos.x - selectionStartPos.current.x),
        height: Math.abs(pos.y - selectionStartPos.current.y),
      });
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (mode !== 'designer' || !selectionStartPos.current || !selectionRect) {
      selectionStartPos.current = null;
      setSelectionRect(null);
      return;
    }

    const box = selectionRect;
    if (box.width > 2 && box.height > 2) {
      const intersectedIds = elements.filter(el => {
        const ex = el.x;
        const ey = el.y;
        const ew = el.width || 40;
        const eh = el.height || 40;
        return (
          ex < box.x + box.width &&
          ex + ew > box.x &&
          ey < box.y + box.height &&
          ey + eh > box.y
        );
      }).map(el => el.id);

      if (intersectedIds.length > 0) {
        if (e.evt.shiftKey) {
          setSelection([...new Set([...selectedIds, ...intersectedIds])]);
        } else {
          setSelection(intersectedIds);
        }
      }
    }

    selectionStartPos.current = null;
    setSelectionRect(null);
  };

  // Attach Transformer to selected nodes
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    if (selectedIds.length > 0 && mode === 'designer') {
      const nodes = selectedIds
        .map(id => stageRef.current?.findOne(`#${id}`))
        .filter((node): node is Konva.Node => node !== undefined && node !== null);
        
      const selectedEls = elements.filter(el => selectedIds.includes(el.id));
      const hasPipe = selectedEls.some(el => el.type === 'pipe');
      
      if (nodes.length > 0 && !hasPipe) {
        transformerRef.current.nodes(nodes);
      } else {
        transformerRef.current.nodes([]);
      }
    } else {
      transformerRef.current.nodes([]);
    }

    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedIds, mode, elements]);

  return (
    <div style={{ background: '#0a0a0a', width: '100%', height: '100%' }}>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={stage.scale}
        scaleY={stage.scale}
        x={stage.x}
        y={stage.y}
        onWheel={handleWheel}
        draggable={mode === 'designer' && !selectionStartPos.current}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* GRID LAYER */}
        <Layer id="grid-layer">
          {mode === 'designer' && (
            <Rect
              x={-5000}
              y={-5000}
              width={10000}
              height={10000}
              fillPriority="pattern"
              fillPatternImage={(() => {
                if (typeof window === 'undefined') return undefined;
                const canvas = document.createElement('canvas');
                canvas.width = GRID_SIZE;
                canvas.height = GRID_SIZE;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#333';
                  ctx.beginPath();
                  ctx.arc(1, 1, 1, 0, Math.PI * 2);
                  ctx.fill();
                }
                return canvas as unknown as HTMLImageElement;
              })()}
              fillPatternRepeat="repeat"
              listening={false}
            />
          )}
        </Layer>

        {/* PIPE LAYER */}
        <Layer id="pipe-layer">
          <PipeLayer mode={mode} />
        </Layer>

        {/* EQUIPMENT LAYER */}
        <Layer id="equipment-layer">
          {elements.map((el) => {
            const tag = el.props.tag;
            const device = tag ? plcData[tag] : null;
            // Motor state uses STAT_RUNNING; generic tags use VALUE
            const isRunning = device?.state?.STAT_RUNNING || device?.state?.VALUE;

            if (el.type === 'motor') {
              return <MotorElement key={el.id} element={el} mode={mode} plcValue={isRunning} />;
            }
            if (el.type === 'elevator') {
              return <ElevatorElement key={el.id} element={el} mode={mode} plcValue={isRunning} />;
            }
            if (el.type === 'pipe') {
              return null; // El PipeLayer se encarga de esto
            }
            return <GenericElement key={el.id} element={el} mode={mode} plcValue={isRunning} />;
          })}
        </Layer>

        {/* TRANSFORMER LAYER — always rendered, useEffect controls which node is attached */}
        <Layer id="ui-layer">
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 10 || newBox.height < 10) return oldBox;
              return newBox;
            }}
            onTransformEnd={(e) => {
              const nodes = transformerRef.current?.nodes() || [];
              nodes.forEach(node => {
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                node.scaleX(1);
                node.scaleY(1);
                updateElement(node.id(), {
                  x: snapToGrid(node.x()),
                  y: snapToGrid(node.y()),
                  width: Math.max(10, snapToGrid(node.width() * scaleX)),
                  height: Math.max(10, snapToGrid(node.height() * scaleY)),
                  rotation: node.rotation(),
                });
              });
            }}
          />
          {/* RECTÁNGULO DE SELECCIÓN */}
          {selectionRect && (
            <Rect
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(0, 161, 255, 0.3)"
              stroke="rgba(0, 161, 255, 0.8)"
              strokeWidth={1}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default ScadaStage;
