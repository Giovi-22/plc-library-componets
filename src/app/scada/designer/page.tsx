'use client';

import React, { useEffect } from 'react';
import { CanvasContainer } from '@/lib/scada/components/CanvasContainer';
import { useLayoutStore } from '@/lib/scada/store/useLayoutStore';
import { ElementType, ScadaElement } from '@/lib/scada/types';
import { API_URL, snapToGrid } from '@/lib/config';
import { Settings, Save, Play, Square, Circle, MoveRight, Database, RotateCw } from 'lucide-react';

export default function ScadaDesignerPage() {
  const elements = useLayoutStore((state) => state.elements);
  const fetchLayout = useLayoutStore((state) => state.fetchLayout);
  const saveLayout = useLayoutStore((state) => state.saveLayout);
  const isSaving = useLayoutStore((state) => state.isSaving);
  const addElement = useLayoutStore((state) => state.addElement);
  const selectedId = useLayoutStore((state) => state.selectedId);
  const updateElement = useLayoutStore((state) => state.updateElement);

  const [availableDevices, setAvailableDevices] = React.useState<any[]>([]);
  const [showAllTags, setShowAllTags] = React.useState(false);
  const [hasMounted, setHasMounted] = React.useState(false);

  const selectedElement = elements.find(el => el.id === selectedId);

  const fetchAvailableDevices = async () => {
    try {
      const res = await fetch(`${API_URL}/devices`);
      const data = await res.json();
      setAvailableDevices(data);
    } catch (error) {
      console.error('Error fetching devices for picker:', error);
    }
  };

  useEffect(() => {
    setHasMounted(true);
    fetchLayout();
    fetchAvailableDevices();
  }, [fetchLayout]);

  if (!hasMounted) return null;

  const handleAddElement = (type: ElementType) => {
    const id = `${type.toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    
    // Snapping inicial al centro aproximado del viewport
    const initialX = snapToGrid(250);
    const initialY = snapToGrid(250);

    // Tamaños por defecto según tipo
    const defaults: Record<string, { w: number, h: number }> = {
      motor: { w: 60, h: 40 },
      valve: { w: 40, h: 30 },
      sensor: { w: 30, h: 30 },
      elevator: { w: 50, h: 200 },
      conveyor: { w: 200, h: 30 },
      redler: { w: 200, h: 40 },
      silo: { w: 100, h: 150 },
      tank: { w: 120, h: 120 },
      pipe: { w: 100, h: 10 }
    };

    const size = defaults[type] || { w: 50, h: 50 };

    const newElement: ScadaElement = {
      id,
      type,
      x: type === 'pipe' ? 0 : initialX,
      y: type === 'pipe' ? 0 : initialY,
      rotation: 0,
      width: size.w,
      height: size.h,
      props: {
        name: `Nuevo ${type}`,
      }
    };

    if (type === 'pipe') {
      newElement.points = [initialX, initialY, initialX + 100, initialY];
      newElement.props.thickness = 10;
      newElement.props.color = '#7f8c8d';
    }

    addElement(newElement);
  };

  const handleRotatePipe = () => {
    if (!selectedId || !selectedElement || selectedElement.type !== 'pipe') return;
    const points = selectedElement.points || [];
    if (points.length < 2) return;

    const x0 = points[0];
    const y0 = points[1];

    const newPoints = [];
    for (let i = 0; i < points.length; i += 2) {
      const dx = points[i] - x0;
      const dy = points[i + 1] - y0;
      // Rotación 90°: (x, y) -> (x0 - dy, y0 + dx)
      newPoints.push(x0 - dy);
      newPoints.push(y0 + dx);
    }
    updateElement(selectedId, { points: newPoints });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        height: '60px', 
        background: '#1a1a1a', 
        borderBottom: '1px solid #333',
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 2rem',
        justifyContent: 'space-between'
      }}>
        <h1 style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 800 }}>
          SCADA DESIGNER <small style={{ color: '#666', fontWeight: 400 }}>| Modo Edición</small>
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => saveLayout()}
            disabled={isSaving}
            style={{ 
              background: isSaving ? '#444' : '#333', 
              border: 'none', 
              padding: '0.5rem 1.2rem', 
              borderRadius: '8px', 
              color: 'white', 
              cursor: isSaving ? 'wait' : 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}>
            {isSaving ? '⏳ GUARDANDO...' : <><Save size={16} /> GUARDAR</>}
          </button>
          <button 
            onClick={() => window.location.href = '/scada/runtime'}
            style={{ background: 'var(--accent)', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
            ▶ PLAY RUNTIME
          </button>
        </div>
      </header>
      
      <main style={{ flex: 1, position: 'relative' }}>
        <CanvasContainer mode="designer" />
        
        {/* CATEGORIZED TOOLBOX */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          width: '240px', 
          background: 'rgba(15,15,15,0.95)', 
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
          zIndex: 10,
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto'
        }}>
          <ToolCategory title="EQUIPOS DE CONTROL">
            <ToolItem icon={<Database size={18} />} label="Motor" onClick={() => handleAddElement('motor')} />
            <ToolItem icon={<Square size={18} />} label="Válvula" onClick={() => handleAddElement('valve')} />
            <ToolItem icon={<Circle size={18} />} label="Sensor" onClick={() => handleAddElement('sensor')} />
          </ToolCategory>

          <ToolCategory title="TRANSPORTE">
            <ToolItem icon={<Play size={18} rotate={90} />} label="Elevador" onClick={() => handleAddElement('elevator')} />
            <ToolItem icon={<MoveRight size={18} />} label="Redler / Canal" onClick={() => handleAddElement('redler')} />
            <ToolItem icon={<MoveRight size={18} />} label="Cinta Transp." onClick={() => handleAddElement('conveyor')} />
          </ToolCategory>

          <ToolCategory title="ALMACENAMIENTO">
            <ToolItem icon={<Square size={18} />} label="Silo Industrial" onClick={() => handleAddElement('silo')} />
            <ToolItem icon={<Circle size={18} />} label="Tanque / Cuba" onClick={() => handleAddElement('tank')} />
          </ToolCategory>

          <ToolCategory title="INFRAESTRUCTURA">
            <ToolItem icon={<MoveRight size={18} />} label="Cañería" onClick={() => handleAddElement('pipe')} />
          </ToolCategory>
        </div>

        {/* PROPERTY EDITOR (Placeholder) */}
        {selectedId && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '280px',
            background: 'rgba(20,20,20,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(15px)',
            borderRadius: '12px',
            padding: '20px',
            color: 'white',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 10
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--accent)' }}>
              PROPIEDADES EQUIPO
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#666', display: 'block', marginBottom: '5px' }}>ID</label>
                <input 
                  type="text" 
                  value={selectedId} 
                  readOnly 
                  style={{ background: '#111', border: '1px solid #333', color: '#888', padding: '8px', borderRadius: '4px', width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: '#666', display: 'block', marginBottom: '5px' }}>NOMBRE</label>
                <input 
                  type="text" 
                  value={selectedElement?.props.name || ''} 
                  onChange={(e) => updateElement(selectedId, { props: { ...selectedElement?.props, name: e.target.value } })}
                  style={{ background: '#111', border: '1px solid #444', color: 'white', padding: '8px', borderRadius: '4px', width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>TAG PLC</label>
                  <label style={{ fontSize: '0.6rem', color: showAllTags ? 'var(--accent)' : '#444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setShowAllTags(!showAllTags)}>
                    {showAllTags ? '👁️ MOSTRANDO TODO' : '🔍 FILTRADO POR TIPO'}
                  </label>
                </div>
                <select 
                  value={selectedElement?.props.tag || ''} 
                  onChange={(e) => updateElement(selectedId!, { props: { ...selectedElement?.props, tag: e.target.value } })}
                  style={{ background: '#111', border: '1px solid #444', color: 'var(--accent)', padding: '8px', borderRadius: '4px', width: '100%', fontFamily: 'monospace', outline: 'none' }}
                >
                  <option value="">-- Sin asignar --</option>
                  {availableDevices
                    .filter(dev => showAllTags || (selectedElement?.type === 'motor' ? dev.type === 'MOTOR' : dev.type !== 'MOTOR'))
                    .map(dev => (
                      <option key={dev.id} value={dev.id}>
                        {dev.id} ({dev.name || dev.type})
                      </option>
                    ))
                  }
                </select>
                <button 
                  onClick={() => window.location.href = '/scada/tags'}
                  style={{ marginTop: '8px', background: 'transparent', border: 'none', color: '#555', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline' }}>
                  + Gestionar Tags en Backend
                </button>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#666', display: 'block', marginBottom: '5px' }}>ROTACIÓN (°)</label>
                <input 
                  type="number" 
                  value={selectedElement?.rotation || 0} 
                  onChange={(e) => updateElement(selectedId, { rotation: parseInt(e.target.value) || 0 })}
                  style={{ background: '#111', border: '1px solid #444', color: 'white', padding: '8px', borderRadius: '4px', width: '100%' }}
                />
              </div>

              {selectedElement?.type === 'pipe' && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ fontSize: '0.75rem', color: '#aaa', lineHeight: '1.4', marginBottom: '10px', background: 'rgba(0, 229, 255, 0.1)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #00e5ff' }}>
                    💡 <b>Tip Cañerías:</b> <br/>
                    • Haz <b>doble clic</b> sobre la línea para agregar un nuevo punto de quiebre.<br/>
                    • Haz <b>clic derecho</b> en un punto circular para eliminarlo.<br/>
                    • Arrastra los puntos para darle la forma deseada (se ajustarán solos a la cuadrícula).
                  </p>
                  <button 
                    onClick={handleRotatePipe}
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                    background: '#333', 
                    border: '1px solid #444', 
                    color: 'var(--accent)', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    fontWeight: 'bold' 
                  }}>
                  <RotateCw size={16} /> GIRAR 90°
                </button>
                </div>
              )}
            </div>
            <button 
              onClick={() => useLayoutStore.getState().removeElement(selectedId)}
              style={{ marginTop: '20px', width: '100%', padding: '10px', background: 'rgba(255, 64, 129, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              BORRAR ELEMENTO
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function ToolCategory({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div>
      <h4 style={{ fontSize: '0.65rem', color: '#555', letterSpacing: '1px', marginBottom: '8px', fontWeight: 900 }}>{title}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {children}
      </div>
    </div>
  );
}

function ToolItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        height: '40px', 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '8px', 
        cursor: 'pointer',
        display: 'flex',
        padding: '0 10px',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s',
        color: '#888'
      }}
      onMouseEnter={(e) => { 
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; 
        e.currentTarget.style.color = '#00e5ff';
        e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)';
      }}
      onMouseLeave={(e) => { 
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; 
        e.currentTarget.style.color = '#888'; 
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
      }}
    >
      <div style={{ opacity: 0.7 }}>{icon}</div>
      <span style={{ fontSize: '0.7rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </div>
  );
}
