'use client';

import React from 'react';
import { useLayoutStore } from '../store/useLayoutStore';
import { usePLCData } from '../hooks/usePLCData';
import { Pipe } from './elements/Pipe';
import { PipeNodes } from './elements/PipeNodes';

interface PipeLayerProps {
  mode: 'designer' | 'runtime';
}
export const PipeLayer: React.FC<PipeLayerProps> = ({ mode }) => {
  const elements = useLayoutStore((state) => state.elements);
  const selectedId = useLayoutStore((state) => state.selectedId);
  const { data: plcData } = usePLCData();

  // Filtramos solo los elementos tipo cañería
  const pipes = elements.filter((el) => el.type === 'pipe');

  return (
    <>
      {pipes.map((pipe) => {
        const tag = pipe.props.tag;
        // El estado de flujo se determina si el tag tiene VALUE = true o STAT_RUNNING
        const deviceData = tag ? plcData[tag] : null;
        const isFlowing = deviceData?.state?.VALUE || deviceData?.state?.STAT_RUNNING;

        return (
          <React.Fragment key={pipe.id}>
            <Pipe
              element={pipe}
              mode={mode}
              isFlowing={!!isFlowing}
            />
            {/* Si estamos en diseño y seleccionada, mostrar los nodos de control */}
            {mode === 'designer' && selectedId === pipe.id && (
              <PipeNodes element={pipe} />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
