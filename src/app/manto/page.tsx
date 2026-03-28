'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL, SOCKET_URL } from '@/lib/config';
import { MotorFaceplate } from '@/lib/components/MotorFaceplate/MotorFaceplate';

interface Device {
  id: string;
  name: string;
  type: string;
  state: any;
}

export default function MaintenancePage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [workflows, setWorkflows] = useState<any>({});
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const socket = io(SOCKET_URL);

    const fetchDevices = async () => {
      const res = await fetch(`${API_URL}/devices`);
      const data = await res.json();
      setDevices(data);
    };

    fetchDevices();

    socket.on('deviceUpdate', (updatedDevice) => {
      setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
    });

    socket.on('maintenanceWorkflowUpdate', (wf) => {
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

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#05070a] text-white p-4 font-sans pb-20">
      <header className="mb-6 mt-2">
        <h1 className="text-xl font-black mb-1">TERMINAL MANTENIMIENTO</h1>
        <p className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">Área: Molienda / Silos</p>
      </header>

      {/* 🔍 BUSCADOR */}
      <div className="sticky top-4 z-20 mb-6 group">
        <input 
          type="text" 
          placeholder="Buscar Motor o ID..." 
          className="w-full bg-[#0d1117] border border-white/10 p-5 rounded-2xl text-sm focus:border-cyan-500 focus:outline-none transition-all shadow-xl"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</div>
      </div>

      {/* 📜 LISTA DE DISPOSITIVOS (Mobile friendly) */}
      <div className="space-y-3">
        {filteredDevices.map((device) => {
          const mode = device.state?.CONF_MODE_SELECTED || 0;
          const isFault = device.state?.STAT_FAULT || device.state?.FAIL_TERMICO;
          const isRunning = device.state?.STAT_RUNNING;
          const hasWorkflow = !!workflows[device.id];

          return (
            <div 
              key={device.id}
              onClick={() => setSelectedDevice(device)}
              className="bg-[#0d1117] border border-white/5 active:scale-95 transition-all p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden"
            >
              {/* LED DE ESTADO */}
              <div className={`w-3 h-3 rounded-full shrink-0 ${isFault ? 'bg-red-500 shadow-[0_0_10px_red]' : isRunning ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-gray-700'}`} />
              
              <div className="flex-1">
                <div className="font-bold text-sm leading-tight mb-1">{device.name}</div>
                <div className="text-[9px] text-gray-500 font-mono">{device.id}</div>
              </div>

              <div className="text-right">
                <div className={`text-[9px] font-black uppercase tracking-widest ${mode === 3 ? 'text-cyan-400' : 'text-gray-600'}`}>
                  {mode === 1 ? 'LOCAL' : mode === 2 ? 'REMOTO' : 'MANTO'}
                </div>
                {hasWorkflow && (
                   <span className="text-[10px] text-yellow-500 animate-pulse font-bold">⚠️ MANTO PEND.</span>
                )}
              </div>
              
              {/* INDICADOR DE MANTENIMIENTO ACTIVO */}
              {mode === 3 && <div className="absolute top-0 right-0 w-1 h-full bg-cyan-400" />}
            </div>
          );
        })}
      </div>

      {/* 🛠️ MODAL DE CONTROL (FACEPLATE) */}
      {selectedDevice && (
        <MotorFaceplate 
           id={selectedDevice.id}
           name={selectedDevice.name}
           state={devices.find(d => d.id === selectedDevice.id)?.state || {}}
           workflow={workflows[selectedDevice.id]}
           onSendCommand={handleSendCommand}
           onClose={() => setSelectedDevice(null)}
        />
      )}

      {/* FOOTER NAVEGACION */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0d1117]/80 backdrop-blur-xl border-t border-white/5 p-4 flex justify-around items-center z-50">
        <button className="text-cyan-400 flex flex-col items-center gap-1">
          <span className="text-lg">🛠️</span>
          <span className="text-[8px] font-bold">MOTORES</span>
        </button>
        <button className="text-gray-600 flex flex-col items-center gap-1">
           <span className="text-lg">📋</span>
           <span className="text-[8px] font-bold">ORDENES</span>
        </button>
        <button onClick={() => window.location.href = '/login'} className="text-gray-600 flex flex-col items-center gap-1">
           <span className="text-lg">🚪</span>
           <span className="text-[8px] font-bold">LOGOUT</span>
        </button>
      </nav>
    </main>
  );
}
