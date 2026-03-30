'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL, SOCKET_URL } from '@/lib/config';
import { MotorFaceplate } from '@/lib/components/MotorFaceplate/MotorFaceplate';
import { Search, LogOut, ClipboardList, Package, Activity, ChevronRight, MessageSquare, Send } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: string;
  state: any;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: string;
  deviceId?: string;
  message: string;
  user?: string;
}

export default function MaintenancePage() {
  const [view, setView] = useState<'devices' | 'logs'>('devices');
  const [devices, setDevices] = useState<Device[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [workflows, setWorkflows] = useState<any>({});
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const socket = io(SOCKET_URL);

    const fetchData = async () => {
      try {
        const [devRes, logRes] = await Promise.all([
          fetch(`${API_URL}/devices`),
          fetch(`${API_URL}/logs`)
        ]);
        setDevices(await devRes.json());
        setLogs(await logRes.json());
      } catch (e) {
        console.error('Error fetching data', e);
      }
    };

    fetchData();

    socket.on('deviceUpdate', (updatedDevice: Device) => {
      setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
    });

    socket.on('logUpdate', (newLog: LogEntry) => {
      setLogs(prev => [newLog, ...prev]);
    });

    socket.on('maintenanceWorkflowUpdate', (wf: any) => {
      setWorkflows((prev: any) => ({ ...prev, [wf.deviceId]: wf.workflow }));
    });

    return () => { socket.disconnect(); };
  }, []);

  const handleSendCommand = async (signal: string, value: any) => {
    if (!selectedDevice) return;
    await fetch(`${API_URL}/devices/${selectedDevice.id}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signal, value }),
    });
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    await fetch(`${API_URL}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: note, user: 'Técnico Mantenimiento' }),
    });
    setNote('');
  };

  const filteredDevices = (devices || []).filter(d => {
    const name = d.name || d.id || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'var(--background)',
      color: '#fff',
      padding: '1.5rem',
      paddingBottom: '8rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: { marginBottom: '2rem' },
    title: { fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' },
    subtitle: { fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.15rem', textTransform: 'uppercase' as const, opacity: 0.8, marginTop: '0.4rem' },
    searchWrapper: { position: 'relative' as const, marginBottom: '2rem' },
    searchInput: { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem 1.2rem', paddingLeft: '3rem', color: '#fff', fontSize: '0.9rem', outline: 'none' },
    searchIcon: { position: 'absolute' as const, left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral)', opacity: 0.5 },
    list: { display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' },
    listItem: (isManto: boolean) => ({
      background: 'rgba(255,255,255,0.02)',
      border: isManto ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)',
      borderRadius: '1rem', padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s ease'
    }),
    indicator: (isRunning: boolean, isFault: boolean) => ({
      width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: isFault ? 'var(--danger)' : isRunning ? 'var(--success)' : 'rgba(255,255,255,0.1)', marginRight: '1rem'
    }),
    logItem: {
      padding: '1rem',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      animation: 'slideIn 0.3s ease'
    },
    logTime: { fontSize: '0.65rem', color: 'var(--neutral)', marginBottom: '0.3rem' },
    logMsg: { fontSize: '0.85rem', fontWeight: 500 },
    logMeta: { fontSize: '0.7rem', color: 'var(--accent)', marginTop: '0.3rem', fontWeight: 700 },
    inputArea: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      background: 'rgba(255,255,255,0.02)',
      padding: '0.5rem',
      borderRadius: '1rem',
      border: '1px solid rgba(255,255,255,0.05)'
    },
    input: { flex: 1, background: 'none', border: 'none', color: '#fff', padding: '0.5rem 1rem', outline: 'none', fontSize: '0.9rem' },
    sendBtn: { background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '0.8rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    nav: { position: 'fixed' as const, bottom: '1.5rem', left: '1rem', right: '1rem', background: 'rgba(10, 15, 25, 0.9)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.2rem', padding: '0.75rem 0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 1000 },
    navItem: (active: boolean) => ({ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '0.3rem', color: active ? 'var(--accent)' : 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }),
    navLabel: { fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>
          {view === 'devices' ? 'Sistema' : 'Bitácora'} <Activity size={24} color="var(--accent)" />
        </h1>
        <p style={styles.subtitle}>{view === 'devices' ? 'Terminal de Campo - Motores' : 'Registro de Actividades'}</p>
      </header>

      {view === 'devices' ? (
        <>
          <div style={styles.searchWrapper}>
            <Search style={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="Buscar motor por nombre..." 
              style={styles.searchInput}
              className="search-input"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={styles.list}>
            {filteredDevices.map((device) => {
              const isFault = device.state?.STAT_FAULT || device.state?.FAIL_TERMICO;
              const isRunning = device.state?.STAT_RUNNING;
              const isManto = device.state?.CONF_MODE_SELECTED === 2; // Actualizado a 2 según PLC
              return (
                <div key={device.id} style={styles.listItem(isManto)} className="list-item" onClick={() => setSelectedDevice(device)}>
                  <div style={styles.indicator(isRunning, isFault)} />
                  <div style={{ flex: 1, fontSize: '1rem', fontWeight: 700 }}>{device.name || device.id}</div>
                  <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={styles.inputArea}>
            <input 
              style={styles.input} 
              placeholder="Añadir nota de mantenimiento..." 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
            />
            <button style={styles.sendBtn} onClick={handleAddNote}>
              <Send size={18} />
            </button>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.03)', overflow: 'hidden' }}>
            {logs.length > 0 ? logs.map((log) => (
              <div key={log.id} style={styles.logItem}>
                <div style={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString()} - {new Date(log.timestamp).toLocaleDateString()}</div>
                <div style={styles.logMsg}>{log.message}</div>
                {log.deviceId && <div style={styles.logMeta}>{log.deviceId}</div>}
              </div>
            )) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--neutral)', fontSize: '0.8rem' }}>Sin registros recientes.</div>
            )}
          </div>
        </div>
      )}

      {selectedDevice && (
        <MotorFaceplate 
           id={selectedDevice.id}
           name={selectedDevice.name || selectedDevice.id}
           state={devices.find(d => d.id === selectedDevice.id)?.state || {}}
           workflow={workflows[selectedDevice.id]}
           onSendCommand={handleSendCommand}
           onClose={() => setSelectedDevice(null)}
        />
      )}

      <nav style={styles.nav}>
        <button style={styles.navItem(view === 'devices')} onClick={() => setView('devices')}>
          <Package size={20} />
          <span style={styles.navLabel}>Motores</span>
        </button>
        <button style={styles.navItem(view === 'logs')} onClick={() => setView('logs')}>
          <ClipboardList size={20} />
          <span style={styles.navLabel}>Bitácora</span>
        </button>
        <button onClick={() => window.location.href = '/login'} style={{ ...styles.navItem(false), borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
          <LogOut size={20} />
          <span style={styles.navLabel}>Salir</span>
        </button>
      </nav>

      <style jsx>{`
        .list-item:active { background: rgba(255,255,255,0.06) !important; transform: scale(0.98); }
        .search-input:focus { border-color: var(--accent) !important; background: rgba(0, 243, 255, 0.02) !important; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}
