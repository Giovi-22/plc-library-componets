'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Activity, 
  PenTool, 
  Database, 
  Settings, 
  ChevronRight,
  Shield,
  Zap,
  BarChart3
} from 'lucide-react';

export default function ScadaDashboard() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at top left, #1a1a1a, #0a0a0a)',
      color: 'white',
      padding: '4rem 2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: 'var(--accent)' }}>
            <Activity size={32} />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px' }}>
              SCADA <span style={{ color: 'white', fontWeight: 300 }}>CONTROL CENTER</span>
            </h1>
          </div>
          <p style={{ color: '#888', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
            Plataforma de gestión industrial de alta precisión para el monitoreo y control de procesos en tiempo real.
          </p>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '2rem',
          perspective: '1000px'
        }}>
          <DashboardCard 
            title="SISTEMA RUNTIME" 
            description="Monitoreo en tiempo real de la planta, control de motores y visualización de alarmas."
            icon={<Zap size={40} color="#00e5ff" />}
            href="/scada/runtime"
            accent="#00e5ff"
          />
          <DashboardCard 
            title="DESIGNER STUDIO" 
            description="Editor visual de tuberías y equipos. Configuración de layouts y visualización industrial."
            icon={<PenTool size={40} color="#ff4081" />}
            href="/scada/designer"
            accent="#ff4081"
          />
          <DashboardCard 
            title="GÉSTIÓN DE TAGS" 
            description="Configuración de direcciones PLC (S7), tipos de datos y mapeo de señales críticas."
            icon={<Database size={40} color="#ffab40" />}
            href="/scada/tags"
            accent="#ffab40"
          />
        </div>

        <footer style={{ marginTop: '5rem', borderTop: '1px solid #222', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2rem', color: '#555', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} /> Encrypted Connection</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BarChart3 size={14} /> PLC Driver Active</span>
          </div>
          <div style={{ color: '#444', fontSize: '0.8rem' }}>
            v2.1.0-STABLE | DeepMind Coding Assistant
          </div>
        </footer>
      </div>

      <style jsx>{`
        div {
          --accent: #00e5ff;
        }
      `}</style>
    </div>
  );
}

function DashboardCard({ title, description, icon, href, accent }: { title: string, description: string, icon: React.ReactNode, href: string, accent: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'rgba(30, 30, 30, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '2.5rem',
        height: '100%',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="card"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
        e.currentTarget.style.borderColor = accent + '44';
        e.currentTarget.style.boxShadow = `0 20px 40px -15px ${accent}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      >
        <div style={{ marginBottom: '2rem' }}>{icon}</div>
        <h3 style={{ 
          fontSize: '1.4rem', 
          fontWeight: 800, 
          marginBottom: '1rem', 
          color: 'white',
          letterSpacing: '0.5px'
        }}>{title}</h3>
        <p style={{ color: '#888', lineHeight: 1.6, marginBottom: '2.5rem', flex: 1 }}>{description}</p>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: accent, 
          fontSize: '0.9rem', 
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          ACCEDER AHOra <ChevronRight size={16} />
        </div>

        {/* Subtle decorative element */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-20%',
          width: '40%',
          height: '40%',
          background: `radial-gradient(circle, ${accent}11 0%, transparent 70%)`,
          pointerEvents: 'none'
        }} />
      </div>
    </Link>
  );
}
