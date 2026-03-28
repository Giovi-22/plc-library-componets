'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/config'; // <-- NUEVO

export default function AdminPage() {
  const [devices, setDevices] = useState([]);
  const [newDev, setNewDev] = useState({ id: '', type: 'MOTOR', db: 5, offset: 0 });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    const res = await fetch(`${API_URL}/devices`);
    const data = await res.json();
    setDevices(data);
  };

  const handleAddDev = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_URL}/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDev),
    });
    setNewDev({ id: '', type: 'MOTOR', db: 5, offset: 0 });
    fetchDevices();
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/devices/${id}`, { method: 'DELETE' });
      fetchDevices();
    } catch (e) {}
  };



  return (
    <main style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: 'var(--accent)' }}>Gestión de Dispositivos (UDT Mode)</h1>
        <Link href="/" style={{ color: 'var(--neutral)', textDecoration: 'underline' }}>Volver al SCADA</Link>
      </header>

      <section className="card glass" style={{ marginBottom: '2rem' }}>
        <h3>Añadir Nuevo Dispositivo</h3>
        <form onSubmit={handleAddDev} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <input 
            placeholder="ID Dispositivo (Ej: MOT-107)" 
            value={newDev.id}
            onChange={e => setNewDev({...newDev, id: e.target.value})}
            style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white', borderRadius: '4px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>DB:</span>
            <input 
              type="number"
              value={newDev.db}
              onChange={e => setNewDev({...newDev, db: parseInt(e.target.value)})}
              style={{ width: '60px', padding: '0.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Offset:</span>
            <input 
              type="number"
              value={newDev.offset}
              onChange={e => setNewDev({...newDev, offset: parseInt(e.target.value)})}
              style={{ width: '60px', padding: '0.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white' }}
            />
          </div>
          <select 
            value={newDev.type}
            onChange={e => setNewDev({...newDev, type: e.target.value as any})}
            style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white', borderRadius: '4px' }}
          >
            <option value="MOTOR">MOTOR (UDT Standard)</option>
          </select>
          <button type="submit" style={{ padding: '0.5rem 1rem', background: 'var(--success)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            AÑADIR INSTANCIA
          </button>
        </form>
      </section>

      <section className="card glass">
        <h3>Dispositivos Activos</h3>
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--card-border)' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th>Tipo</th>
              <th>Estado Principal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((dev: any) => (
              <tr key={dev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{dev.id}</td>
                <td><span style={{ fontSize: '0.7rem', background: 'var(--accent)', color: 'black', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{dev.type || 'MOTOR'}</span></td>
                <td>
                  <span style={{ color: dev.state?.STAT_RUNNING ? 'var(--success)' : 'var(--neutral)' }}>
                    {dev.state?.STAT_RUNNING ? 'EN MARCHA' : 'PARADO'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleDelete(dev.id)} style={{ padding: '4px 8px', background: 'var(--danger)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    BORRAR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

