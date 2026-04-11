'use client';

import React, { useEffect } from 'react';
import { CanvasContainer } from '@/lib/scada/components/CanvasContainer';
import { useLayoutStore } from '@/lib/scada/store/useLayoutStore';
import { usePLCData } from '@/lib/scada/hooks/usePLCData';
import { MotorFaceplate } from '@/lib/components/MotorFaceplate/MotorFaceplate';
import { API_URL } from '@/lib/config';

export default function ScadaRuntimePage() {
  const fetchLayout = useLayoutStore((state) => state.fetchLayout);
  const activeFaceplateId = useLayoutStore((state) => state.activeFaceplateId);
  const closeFaceplate = useLayoutStore((state) => state.closeFaceplate);
  const elements = useLayoutStore((state) => state.elements);
  const { data: plcData } = usePLCData();
  const [hasMounted, setHasMounted] = React.useState(false);

  useEffect(() => {
    setHasMounted(true);
    fetchLayout();
  }, [fetchLayout]);

  if (!hasMounted) return null;

  // Encontrar datos para el faceplate activo
  const activeDevice = activeFaceplateId ? plcData[activeFaceplateId] : null;
  const activeElement = activeFaceplateId ? elements.find(el => el.props.tag === activeFaceplateId) : null;

  const handleSendCommand = async (signal: string, value: any) => {
    if (!activeFaceplateId) return;
    try {
      await fetch(`${API_URL}/devices/${activeFaceplateId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal, value })
      });
    } catch (error) {
      console.error('Error sending command:', error);
    }
  };
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        height: '60px', 
        background: '#0a0a0a', 
        borderBottom: '2px solid #222',
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 2rem',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4CAF50', boxShadow: '0 0 10px #4CAF50' }} />
          <h1 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>
            RUNTIME <small style={{ color: '#666', fontWeight: 400 }}>| Planta General</small>
          </h1>
        </div>
        
        <button 
          onClick={() => window.location.href = '/scada/designer'}
          style={{ background: '#333', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
          ✏️ EDITAR LAYOUT
        </button>
      </header>
      
      <main style={{ flex: 1 }}>
        <CanvasContainer mode="runtime" />
      </main>

      {/* RENDERIZADO DEL FACEPLATE */}
      {activeFaceplateId && activeDevice && (
        <MotorFaceplate
          id={activeFaceplateId}
          name={activeElement?.props.name || activeFaceplateId}
          state={activeDevice.state}
          onSendCommand={handleSendCommand}
          onClose={closeFaceplate}
        />
      )}
    </div>
  );
}
