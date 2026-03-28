'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState<'OPERADOR' | 'TECNICO'>('OPERADOR');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('user_role', role);
    if (role === 'TECNICO') {
      if (credentials.username === 'tecnico-mantenimiento' && credentials.password === 'mantenimiento') {
        router.push('/manto');
      } else {
        alert('Credenciales de Técnico Incorrectas');
      }
    } else {
      router.push('/');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background)',
      padding: '2rem'
    },
    card: {
      width: '100%',
      maxW: '420px',
      padding: '2.5rem',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '1.5rem',
      position: 'relative' as const
    },
    title: {
      fontSize: '3rem',
      fontWeight: 800,
      color: 'var(--accent)',
      textTransform: 'uppercase' as const,
      lineHeight: 1,
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: 'var(--neutral)',
      fontSize: '0.85rem',
      fontWeight: 500,
      fontStyle: 'italic',
      marginBottom: '3rem'
    },
    toggleContainer: {
      display: 'flex',
      gap: '0.5rem',
      background: 'rgba(255,255,255,0.03)',
      padding: '0.4rem',
      borderRadius: '1rem',
      marginBottom: '2rem'
    },
    toggleButton: (active: boolean) => ({
      flex: 1,
      padding: '1rem',
      borderRadius: '0.75rem',
      fontSize: '0.7rem',
      fontWeight: 800,
      letterSpacing: '0.15em',
      border: active ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
      background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
      color: active ? '#ffffff' : 'rgba(255,255,255,0.4)',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }),
    inputGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      fontSize: '0.65rem',
      fontWeight: 800,
      color: 'var(--neutral)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.2em',
      marginBottom: '0.6rem',
      marginLeft: '0.2rem'
    },
    input: {
      width: '100%',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '1rem',
      padding: '1.1rem 1.2rem',
      fontSize: '0.9rem',
      color: '#ffffff',
      outline: 'none',
      transition: 'border 0.3s ease'
    },
    submitButton: {
      width: '100%',
      marginTop: '1.5rem',
      padding: '1.2rem',
      background: '#ffffff',
      color: '#000000',
      borderRadius: '1.1rem',
      fontSize: '0.75rem',
      fontWeight: 900,
      letterSpacing: '0.15em',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.8rem',
      transition: 'all 0.3s ease'
    },
    backLink: {
      position: 'absolute' as const,
      top: '-2.5rem',
      left: '0',
      color: 'var(--neutral)',
      fontSize: '0.7rem',
      fontWeight: 800,
      textTransform: 'uppercase' as const,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      background: 'none',
      border: 'none'
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ ...styles.card, maxWidth: '420px' }}>
        <button onClick={handleBack} style={styles.backLink}>
          <ArrowLeft size={14} /> Regresar
        </button>

        <header>
          <h1 style={styles.title}>SCADA CENTRAL</h1>
          <p style={styles.subtitle}>Red Molinos - Módulo de Autenticación</p>
        </header>

        <form onSubmit={handleLogin}>
          <div style={styles.toggleContainer}>
            <button 
              type="button" 
              onClick={() => setRole('OPERADOR')} 
              style={styles.toggleButton(role === 'OPERADOR')}
            >
              OPERADOR
            </button>
            <button 
              type="button" 
              onClick={() => setRole('TECNICO')} 
              style={styles.toggleButton(role === 'TECNICO')}
            >
              MANTENIMIENTO
            </button>
          </div>

          <div style={{ minHeight: '180px' }}>
            {role === 'TECNICO' ? (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Usuario de Campo</label>
                  <input 
                    type="text" 
                    style={styles.input} 
                    placeholder="p. ej. tecnico_01"
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Clave Acceso</label>
                  <input 
                    type="password" 
                    style={styles.input} 
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    required
                  />
                </div>
              </div>
            ) : (
              <div style={{ padding: '1rem', borderLeft: '2px solid rgba(255,255,255,0.05)', color: 'var(--neutral)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                Acceso público para Operadores. Permite visualización en tiempo real de todos los dispositivos y control básico de planta.
              </div>
            )}
          </div>

          <button type="submit" style={styles.submitButton} className="hover-scale">
            INGRESAR AL SISTEMA <ArrowRight size={16} />
          </button>
        </form>

        <style jsx>{`
          .hover-scale:hover {
            transform: scale(1.02);
            filter: brightness(1.1);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}




