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
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [lastEmergencyState, setLastEmergencyState] = useState(false);

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
      try {
        const res = await fetch(`${API_URL}/devices`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const data = await res.json();
        setDevices(data);
        setErrorBanner(null);
      } catch (err) {
        setErrorBanner('🔴 No hay conexión con el Servidor Node.js. Verifica la IP instalada en la configuración de Red.');
      }
    };

    fetchDevices();

    return () => {
      socket.disconnect();
    };
  }, []);

  // Detector de Parada de Emergencia
  const emergencyDevice = devices.find(d => d.id === 'GLOBAL_EMERGENCY');
  const isEmergencyActive = !!emergencyDevice?.state?.VALUE;

  useEffect(() => {
    if (isEmergencyActive && !lastEmergencyState) {
      setShowEmergencyModal(true);
    }
    setLastEmergencyState(isEmergencyActive);
  }, [isEmergencyActive, lastEmergencyState]);

  const handleSendCommand = async (signal: string, value: any) => {
    if (!selectedMotor) return;
    try {
      await fetch(`${API_URL}/devices/${selectedMotor.id}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal, value }),
      });
      setErrorBanner(null);
    } catch (err) {
      setErrorBanner('🔴 Falló el envío del comando. El servidor no responde.');
    }
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
            onClick={() => window.location.href = '/config'}
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
            ⚙️ RED
          </button>
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
            🔑 ROL
          </button>
          
          {emergencyDevice && (
            <div style={{
              background: isEmergencyActive ? 'rgba(255, 64, 129, 0.2)' : 'rgba(76, 175, 80, 0.1)',
              border: `1px solid ${isEmergencyActive ? 'var(--danger)' : '#4CAF50'}`,
              padding: '0.6rem 1.2rem',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: isEmergencyActive ? 'pointer' : 'default'
            }}
            onClick={() => isEmergencyActive && setShowEmergencyModal(true)}
            >
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isEmergencyActive ? 'var(--danger)' : '#4CAF50',
                boxShadow: isEmergencyActive ? '0 0 10px var(--danger)' : 'none'
              }} />
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 800, 
                color: isEmergencyActive ? 'var(--danger)' : '#4CAF50' 
              }}>
                {isEmergencyActive ? 'PARADA EMERGENCIA ACTIVA' : 'SISTEMA OK'}
              </span>
            </div>
          )}

          <StatusBadge status={isConnected ? 'online' : 'offline'} />
        </div>
      </header>

      {errorBanner && (
        <div style={{
          background: 'rgba(255, 64, 129, 0.15)',
          border: '1px solid var(--danger)',
          padding: '1rem',
          borderRadius: '0.75rem',
          color: 'var(--foreground)',
          fontWeight: 600,
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          {errorBanner}
        </div>
      )}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
        {devices
          .filter(d => d.type !== 'SYSTEM')
          .map((device) => {
            const status = device.state?.STAT_FAULT || device.state?.FAIL_TERMICO ? 'fault' :
              device.state?.STAT_RUNNING ? 'running' : 'stopped';

            return (
              <div key={device.id} onClick={() => setSelectedMotor(device)}>
                <Motor
                  id={device.id}
                  name={device.name || device.id}
                  status={status}
                />
              </div>
            );
          })}
      </section>

      {selectedMotor && (
        <MotorFaceplate
          id={selectedMotor.id}
          name={selectedMotor.name || selectedMotor.id}
          state={devices.find(d => d.id === selectedMotor.id)?.state || {}}
          workflow={workflows[selectedMotor.id]}
          onSendCommand={handleSendCommand}
          onClose={() => setSelectedMotor(null)}
        />
      )}

      {showEmergencyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '2rem',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            background: 'var(--danger)',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '4rem',
            marginBottom: '2rem',
            boxShadow: '0 0 50px var(--danger)',
            animation: 'pulse 1.5s infinite'
          }}>
            ⚠️
          </div>
          <h2 style={{ fontSize: '4rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>
            PARADA DE EMERGENCIA ACTIVA
          </h2>
          <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.7)', maxWidth: '800px', marginBottom: '3rem' }}>
            Se ha detectado una activación de la línea de seguridad global. 
            Todos los procesos han sido detenidos por el PLC. 
            Verifica el estado físico de los pulsadores antes de rearmar.
          </p>
          <button
            onClick={() => setShowEmergencyModal(false)}
            style={{
              background: 'white',
              color: 'black',
              border: 'none',
              padding: '1.5rem 4rem',
              borderRadius: '1rem',
              fontSize: '1.2rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ENTENDIDO / CERRAR AVISO
          </button>

          <style jsx>{`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.8; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </main>
  );
}
