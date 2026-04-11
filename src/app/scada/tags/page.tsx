'use client';

import React, { useEffect, useState } from 'react';
import { API_URL } from '@/lib/config';
import { Plus, Trash2, Database, Settings, ArrowLeft } from 'lucide-react';

interface DeviceConfig {
  id: string;
  name?: string;
  type: 'MOTOR' | 'SYSTEM' | 'GENERIC';
  db: number;
  offset: number;
  commandDb?: number;
  commandOffset?: number;
  dataType?: string;
  bit?: number;
}

export default function TagsManagementPage() {
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [newDevice, setNewDevice] = useState<Partial<DeviceConfig>>({
    type: 'MOTOR',
    db: 1,
    offset: 0,
    bit: 0,
    dataType: 'BOOL',
    commandDb: 3,
    commandOffset: 0
  });

  const fetchDevices = async () => {
    try {
      const res = await fetch(`${API_URL}/devices`);
      const data = await res.json();
      setDevices(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const getDisplayAddress = (dev: DeviceConfig) => {
    const typeMap: Record<string, string> = {
      'BOOL': 'DBX',
      'REAL': 'DBD',
      'INT': 'DBW',
      'WORD': 'DBW'
    };
    
    if (dev.type === 'MOTOR') {
      return `DB${dev.db}.UDT${dev.offset}`;
    }
    
    const prefix = typeMap[dev.dataType || ''] || 'DBX';
    return `DB${dev.db}.${prefix}${dev.offset}${dev.dataType === 'BOOL' ? '.' + (dev.bit || 0) : ''}`;
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isEditing ? 'POST' : 'POST'; // El backend usa POST para crear/actualizar via addDevice
      await fetch(`${API_URL}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice)
      });
      setShowForm(false);
      setIsEditing(false);
      fetchDevices();
    } catch (error) {
      alert('Error al procesar el dispositivo');
    }
  };

  const startEdit = (dev: DeviceConfig) => {
    setNewDevice(dev);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`¿Estás seguro de eliminar el dispositivo ${id}?`)) return;
    try {
      await fetch(`${API_URL}/devices/${id}`, { method: 'DELETE' });
      fetchDevices();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <button 
            onClick={() => window.location.href = '/scada/designer'}
            style={{ background: 'transparent', border: 'none', color: '#666', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Volver al Editor
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>Gestión de Tags PLC</h1>
          <p style={{ color: '#666' }}>Configuración de dispositivos y mapeo de memoria S7</p>
        </div>
        <button 
          onClick={() => {
            setNewDevice({ type: 'MOTOR', db: 1, offset: 0, bit: 0, dataType: 'BOOL', commandDb: 3, commandOffset: 0 });
            setIsEditing(false);
            setShowForm(!showForm);
          }}
          style={{ background: 'var(--accent)', color: 'black', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Plus size={20} /> NUEVO DISPOSITIVO
        </button>
      </header>

      {showForm && (
        <section style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '2rem', marginBottom: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={20} color="var(--accent)" /> {isEditing ? `Editando: ${newDevice.id}` : 'Configurar Nuevo Dispositivo'}
          </h2>
          <form onSubmit={handleCreateOrUpdate} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div className="field">
              <label>ID (Unico)</label>
              <input type="text" required readOnly={isEditing} value={newDevice.id || ''} onChange={e => setNewDevice({...newDevice, id: e.target.value})} style={{ opacity: isEditing ? 0.6 : 1 }} />
            </div>
            <div className="field">
              <label>Nombre Descriptivo</label>
              <input type="text" value={newDevice.name || ''} onChange={e => setNewDevice({...newDevice, name: e.target.value})} />
            </div>
            <div className="field">
              <label>Tipo</label>
              <select value={newDevice.type} onChange={e => setNewDevice({...newDevice, type: e.target.value as any})}>
                <option value="MOTOR">MOTOR (Completo)</option>
                <option value="SYSTEM">SISTEMA (E-Stop, etc)</option>
                <option value="GENERIC">GENERICO (Tag Suelto)</option>
              </select>
            </div>
            
            <div className="field">
              <label>Data Block (DB)</label>
              <input type="number" required value={newDevice.db} onChange={e => setNewDevice({...newDevice, db: parseInt(e.target.value)})} />
            </div>
            <div className="field">
              <label>Offset Inicial</label>
              <input type="number" required value={newDevice.offset} onChange={e => setNewDevice({...newDevice, offset: parseInt(e.target.value)})} />
            </div>

            {newDevice.type === 'MOTOR' ? (
              <>
                <div className="field">
                  <label>DB Comandos</label>
                  <input type="number" value={newDevice.commandDb} onChange={e => setNewDevice({...newDevice, commandDb: parseInt(e.target.value)})} />
                </div>
                <div className="field">
                  <label>Offset Comandos</label>
                  <input type="number" value={newDevice.commandOffset} onChange={e => setNewDevice({...newDevice, commandOffset: parseInt(e.target.value)})} />
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <label>Tipo de Dato</label>
                  <select value={newDevice.dataType} onChange={e => setNewDevice({...newDevice, dataType: e.target.value})}>
                    <option value="BOOL">BOOL</option>
                    <option value="REAL">REAL (Float)</option>
                    <option value="INT">INT</option>
                  </select>
                </div>
                {newDevice.dataType === 'BOOL' && (
                  <div className="field">
                    <label>Bit (0-7)</label>
                    <input type="number" min="0" max="7" value={newDevice.bit || 0} onChange={e => setNewDevice({...newDevice, bit: parseInt(e.target.value)})} />
                  </div>
                )}
              </>
            )}

            <div style={{ gridColumn: 'span 3', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" style={{ background: 'var(--accent)', color: 'black', border: 'none', padding: '0.8rem 2rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isEditing ? 'ACTUALIZAR DISPOSITIVO' : 'GUARDAR DISPOSITIVO'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setIsEditing(false); }} style={{ background: '#222', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '6px', cursor: 'pointer' }}>CANCELAR</button>
            </div>
          </form>
        </section>
      )}

      <section>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#111', borderRadius: '12px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#1a1a1a', textAlign: 'left', borderBottom: '1px solid #222' }}>
              <th style={{ padding: '1.2rem' }}>DISPOSITIVO</th>
              <th>TIPO</th>
              <th>DIRECCIÓN PLC (STATUS)</th>
              <th>CMD ADDR</th>
              <th style={{ textAlign: 'right', paddingRight: '2rem' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {devices.map(dev => (
              <tr key={dev.id} style={{ borderBottom: '1px solid #222', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#151515'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#222', padding: '8px', borderRadius: '8px', color: 'var(--accent)' }}><Database size={18} /></div>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{dev.id}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{dev.name || 'Sin nombre'}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, background: dev.type === 'MOTOR' ? '#2e7d3233' : '#1565c033', color: dev.type === 'MOTOR' ? '#4caf50' : '#2196f3', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${dev.type === 'MOTOR' ? '#4caf5044' : '#2196f344'}` }}>
                    {dev.type}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {getDisplayAddress(dev)}
                  </span>
                </td>
                <td style={{ color: '#aaa', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {dev.type === 'MOTOR' ? `DB${dev.commandDb}.UDT${dev.commandOffset}` : '-'}
                </td>
                <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                  <button 
                    onClick={() => startEdit(dev)}
                    style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', padding: '8px', borderRadius: '8px', marginRight: '8px' }}>
                    <Settings size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(dev.id)}
                    style={{ background: 'transparent', border: 'none', color: '#ff4081', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <style jsx>{`
        .field { display: flex; flexDirection: column; gap: 8px; }
        .field label { font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; }
        .field input, .field select { 
          background: #0a0a0a; 
          border: 1px solid #333; 
          color: white; 
          padding: 10px; 
          border-radius: 6px; 
          font-family: inherit;
        }
        .field input:focus { border-color: var(--accent); outline: none; }
      `}</style>
    </div>
  );
}
