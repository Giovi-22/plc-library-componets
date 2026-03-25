'use client';

import React, { useState, useEffect } from 'react';
import { Motor } from '@/lib/components/Motor/Motor';
import { StatusType } from '@/lib/components/StatusBadge/StatusBadge';

export default function Home() {
  const [motor1Status, setMotor1Status] = useState<StatusType>('stopped');
  const [motor1Rpm, setMotor1Rpm] = useState(0);
  const [motor1Current, setMotor1Current] = useState(0);

  const [motor2Status, setMotor2Status] = useState<StatusType>('fault');

  // Simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (motor1Status === 'running') {
        setMotor1Rpm(prev => Math.min(prev + 50, 1450 + Math.random() * 20));
        setMotor1Current(prev => 4.2 + Math.random() * 0.5);
      } else if (motor1Status === 'stopped') {
        setMotor1Rpm(prev => Math.max(prev - 100, 0));
        setMotor1Current(0);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [motor1Status]);

  return (
    <main style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)' }}>
          PLC Component Library
        </h1>
        <p style={{ color: 'var(--neutral)', marginTop: '0.5rem' }}>
          Librería de dispositivos industriales para control de procesos.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '1.5rem', opacity: 0.8 }}>Motores y Actuadores</h2>
        <div className="dashboard-grid">
          <Motor 
            id="MOT-01" 
            name="Elevador Principal" 
            status={motor1Status}
            rpm={Math.round(motor1Rpm)}
            current={motor1Current}
            onStart={() => setMotor1Status('running')}
            onStop={() => setMotor1Status('stopped')}
          />

          <Motor 
            id="MOT-02" 
            name="Bomba de Agua" 
            status={motor2Status}
            rpm={0}
            current={0}
            onStart={() => setMotor2Status('running')}
            onStop={() => setMotor2Status('stopped')}
          />
          
          <Motor 
            id="MOT-03" 
            name="Ventilador Enfriamiento" 
            status="idle"
            rpm={0}
            current={0}
          />
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', opacity: 0.8 }}>Valvulas y Sensores (En Desarrollo)</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="card glass" style={{ flex: 1, padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--neutral)' }}>Sensor de Presión [PT-101]</p>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--success)' }}>12.4 <small>BAR</small></div>
          </div>
          <div className="card glass" style={{ flex: 1, padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--neutral)' }}>Válvula Principal [XV-101]</p>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--danger)' }}>CERRADA</div>
          </div>
        </div>
      </section>

      <footer style={{ marginTop: '4rem', opacity: 0.5, fontSize: '0.8rem', textAlign: 'center' }}>
        &copy; 2026 Molinos - PLC Library Project
      </footer>
    </main>
  );
}
