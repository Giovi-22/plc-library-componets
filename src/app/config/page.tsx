'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfigPage() {
  const [ip, setIp] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Cargar la IP actual si ya fue configurada, si no, usar el hostname actual
    const savedIp = localStorage.getItem('SCADA_SERVER_IP');
    if (savedIp) {
      setIp(savedIp);
    } else {
      setIp(window.location.hostname);
    }
  }, []);

  const handleSave = () => {
    if (ip.trim() === '') {
      localStorage.removeItem('SCADA_SERVER_IP');
    } else {
      localStorage.setItem('SCADA_SERVER_IP', ip);
    }
    
    // Forzar una recarga para que los componentes y websockets reinicien la conexión
    window.location.href = '/';
  };

  const handleReset = () => {
    localStorage.removeItem('SCADA_SERVER_IP');
    setIp(window.location.hostname);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <h1 style={styles.title}>Conexión al Servidor</h1>
        </div>

        <p style={styles.subtitle}>
          Si el Backend de Node.js (Servidor SCADA) está corriendo en una máquina diferente
          al servidor React Next.js, por favor indica su dirección IP.
        </p>

        <div style={styles.formGroup}>
          <label style={styles.label}>Dirección IP del Servidor:</label>
          <input 
            type="text" 
            placeholder="Ej: 192.168.0.10"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button onClick={handleSave} style={{...styles.btn, ...styles.btnPrimary}}>
            Guardar y Conectar
          </button>
          <button onClick={handleReset} style={{...styles.btn, ...styles.btnSecondary}}>
            Usar Predeterminada (Misma Máquina)
          </button>
          <button onClick={() => router.push('/')} style={{...styles.btn, ...styles.btnGhost}}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    fontFamily: '"Geist", "Inter", sans-serif',
    padding: '20px'
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid #334155'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px'
  },
  icon: {
    width: '32px',
    height: '32px',
    color: '#3b82f6'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#f8fafc'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '32px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    marginBottom: '32px'
  },
  label: {
    color: '#cbd5e1',
    fontWeight: '500',
    fontSize: '14px'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: '#0f172a',
    border: '1px solid #475569',
    color: '#f8fafc',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  btn: {
    padding: '14px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s'
  },
  btnPrimary: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  btnSecondary: {
    backgroundColor: '#334155',
    color: '#f8fafc'
  },
  btnGhost: {
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: '1px solid #475569'
  }
};
