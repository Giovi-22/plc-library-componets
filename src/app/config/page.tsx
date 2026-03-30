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
      <div className="glass" style={styles.card}>
        <div style={styles.header}>
          <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <h1 style={styles.title}>Configuración de Red</h1>
        </div>

        <p style={styles.subtitle}>
          Si el Servidor Node.js (Driver SCADA) está corriendo en una máquina diferente
          al Front-End de Operación, especifica su ruta IP local.
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
            Guardar IP y Conectar
          </button>
          <button onClick={handleReset} style={{...styles.btn, ...styles.btnSecondary}}>
            Restablecer a Localhost
          </button>
          <button onClick={() => router.push('/')} style={{...styles.btn, ...styles.btnGhost}}>
            Volver a SCADA
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
    backgroundColor: 'var(--background)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    padding: '20px'
  },
  card: {
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
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
    color: 'var(--accent)'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--accent)'
  },
  subtitle: {
    color: 'var(--neutral)',
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
    color: 'var(--neutral)',
    fontWeight: '600',
    fontSize: '14px'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: 'rgba(5, 7, 10, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'var(--foreground)',
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
    fontWeight: '800',
    fontSize: '15px',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
    textTransform: 'uppercase' as const,
  },
  btnPrimary: {
    backgroundColor: 'var(--accent)',
    color: '#000',
  },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: 'var(--foreground)',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  btnGhost: {
    backgroundColor: 'transparent',
    color: 'var(--neutral)',
  }
};
