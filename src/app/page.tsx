'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL, SOCKET_URL } from '@/lib/config';
import { Motor } from '@/lib/components/Motor/Motor';
import { StatusBadge } from '@/lib/components/StatusBadge/StatusBadge';
import { MotorFaceplate } from '@/lib/components/MotorFaceplate/MotorFaceplate';

interface Device {
  id: string;
  name: string;
  type: string;
  state: any;
}

export default function Home() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedMotor, setSelectedMotor] = useState<Device | null>(null);
  const [workflows, setWorkflows] = useState<any>({});

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('deviceUpdate', (updatedDevice: Device) => {
      setDevices((prev) => prev.map((d) => (d.id === updatedDevice.id ? updatedDevice : d)));
    });

    socket.on('maintenanceWorkflowUpdate', (data: { deviceId: string; workflow: any }) => {
      setWorkflows((prev: any) => ({
        ...prev,
        [data.deviceId]: data.workflow
      }));
    });

    const fetchDevices = async () => {
      const res = await fetch(`${API_URL}/devices`);
      const data = await res.json();
      setDevices(data);
    };

    fetchDevices();

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSendCommand = async (signal: string, value: any) => {
    if (!selectedMotor) return;
    await fetch(`${API_URL}/devices/${selectedMotor.id}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signal, value }),
    });
  };

  return (
    <main style={{ padding: '3rem', minHeight: '100vh' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)' }}>
            SCADA Central
          </h1>
          <p style={{ color: 'var(--neutral)', marginTop: '0.5rem' }}>
            Arquitectura Orientada a Objetos PLC (UDT-S7 Mode)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.75rem',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer'
            }}
          >
            🔑 CAMBIAR ROL
          </button>
          <StatusBadge status={isConnected ? 'online' : 'offline'} />
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
        {devices.map((device) => {
          const status = device.state?.STAT_FAULT || device.state?.FAIL_TERMICO ? 'fault' : 
                         device.state?.STAT_RUNNING ? 'running' : 'stopped';
          
          return (
            <div key={device.id} onClick={() => setSelectedMotor(device)}>
              <Motor 
                id={device.id} 
                name={device.name} 
                status={status}
              />
            </div>
          );
        })}
      </section>

      {selectedMotor && (
        <MotorFaceplate 
          id={selectedMotor.id}
          name={selectedMotor.name}
          state={devices.find(d => d.id === selectedMotor.id)?.state || {}}
          workflow={workflows[selectedMotor.id]}
          onSendCommand={handleSendCommand}
          onClose={() => setSelectedMotor(null)}
        />
      )}
    </main>
  );
}
