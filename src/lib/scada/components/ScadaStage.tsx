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
  const selectElement = useLayoutStore((state) => state.selectElement);
  const selectedId = useLayoutStore((state) => state.selectedId);
  const updateElement = useLayoutStore((state) => state.updateElement);

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Whenever selectedId changes, attach the Transformer to the correct Konva node
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    if (selectedId && mode === 'designer') {
      const node = stageRef.current.findOne(`#${selectedId}`);
      // Pipes have their own node-editing system — skip the Transformer for them
      const selectedEl = elements.find((el) => el.id === selectedId);
      if (node && selectedEl?.type !== 'pipe') {
        transformerRef.current.nodes([node]);
      } else {
        transformerRef.current.nodes([]);
      }
    } else {
      transformerRef.current.nodes([]);
    }

    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedId, mode, elements]);

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
        draggable={mode === 'designer'}
        onClick={(e) => {
          // Deselect only when clicking the stage background, not on any element
          if (e.target === e.target.getStage()) {
            selectElement(null);
          }
        }}
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
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();

              // Reset scale and bake into width/height to avoid cumulative scale drift
              node.scaleX(1);
              node.scaleY(1);

              if (selectedId) {
                updateElement(selectedId, {
                  x: snapToGrid(node.x()),
                  y: snapToGrid(node.y()),
                  width: Math.max(10, snapToGrid(node.width() * scaleX)),
                  height: Math.max(10, snapToGrid(node.height() * scaleY)),
                  rotation: node.rotation(),
                });
              }
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default ScadaStage;
