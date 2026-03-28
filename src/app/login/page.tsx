'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [role, setRole] = useState<'OPERADOR' | 'TECNICO'>('OPERADOR');
  const router = useRouter();

  const handleLogin = () => {
    localStorage.setItem('user_role', role);
    if (role === 'TECNICO') {
      router.push('/manto');
    } else {
      router.push('/');
    }
  };

  return (
    <main className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 text-white font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,112,243,0.15)_0%,_transparent_70%)] pointer-events-none" />
      
      <div className="w-full max-w-[400px] p-8 rounded-[2rem] shadow-2xl relative z-10 glass">
        <header className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-blue-500 text-2xl font-black">M</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter mb-2 text-white">SCADA MOLINOS</h1>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">ACCESO A TERMINAL DE CONTROL</p>
        </header>

        <div className="space-y-4">
          <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Seleccionar Identidad</label>
          
          <button 
            onClick={() => setRole('OPERADOR')}
            className={`w-full p-5 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between ${role === 'OPERADOR' ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/5 border-white/5 opacity-50'}`}
          >
            <div>
              <div className="font-bold text-lg text-white">PUESTO CENTRAL</div>
              <div className="text-[10px] text-white/70">CONTROL TOTAL PLANTA</div>
            </div>
            {role === 'OPERADOR' && <span className="text-xl">👤</span>}
          </button>

          <button 
            onClick={() => setRole('TECNICO')}
            className={`w-full p-5 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between ${role === 'TECNICO' ? 'bg-[#00f3ff] border-cyan-400 text-black shadow-[0_0_20px_rgba(0,243,255,0.4)]' : 'bg-white/5 border-white/10 opacity-50'}`}
          >
            <div>
              <div className="font-bold text-lg text-white">MANTENIMIENTO</div>
              <div className="text-[10px] text-white/70">TERMINAL MÓVIL DE CAMPO</div>
            </div>
            {role === 'TECNICO' && <span className="text-xl">🛠️</span>}
          </button>

          <button 
            onClick={handleLogin}
            className="w-full mt-10 py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            INGRESAR AL SISTEMA
          </button>
        </div>

        <footer className="mt-8 text-center text-[10px] text-gray-600 font-bold tracking-widest">
          © {new Date().getFullYear()} ANTIGRAVITY SYSTEMS | V2.4.0
        </footer>
      </div>
    </main>
  );
}

