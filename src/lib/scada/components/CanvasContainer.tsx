'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Cargamos el Stage dinámicamente sin SSR porque Konva depende del DOM
const ScadaStage = dynamic(() => import('./ScadaStage'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#121212',
      color: '#444'
    }}>
      Cargando Canvas Industrial...
    </div>
  )
});

interface CanvasContainerProps {
  mode: 'designer' | 'runtime';
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({ mode }) => {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
      <ScadaStage mode={mode} />
    </div>
  );
};

export default CanvasContainer;
