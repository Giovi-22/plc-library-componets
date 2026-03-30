'use client';

import React, { useState } from 'react';
import styles from './MotorFaceplate.module.css';

interface MotorFaceplateProps {
  id: string;
  name: string;
  state: any;
  workflow?: { prodApproved: boolean, superApproved: boolean } | null;
  onSendCommand: (signal: string, value: any) => void;
  onClose: () => void;
}

export const MotorFaceplate: React.FC<MotorFaceplateProps> = ({ id, name, state = {}, workflow, onSendCommand, onClose }) => {
  const [pendingMode, setPendingMode] = useState<number | null>(null);
  const [requesting, setRequesting] = useState(false);

  const modeStatus = state.CONF_MODE_SELECTED || 0;
  const mode = pendingMode !== null ? pendingMode : modeStatus; 
  const isMaintenance = modeStatus === 2; // Según PLC DB: 0=Local, 1=Remoto, 2=Manto

  const handleModeChange = (newMode: number) => {

    setPendingMode(newMode);
    onSendCommand('CONF_MODE_SELECTED', newMode);
    setTimeout(() => setPendingMode(null), 1500);
  };

  const handleRequest = async () => {
    setRequesting(true);
    await fetch(`http://localhost:3001/devices/${id}/maintenance/request`, { method: 'POST' });
    setTimeout(() => setRequesting(false), 2000);
  };

  const handleApprove = async (role: 'PROD' | 'SUPER') => {
    await fetch(`http://localhost:3001/devices/${id}/maintenance/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
  };

  const handleCancel = async () => {
    await fetch(`http://localhost:3001/devices/${id}/maintenance/cancel`, { method: 'POST' });
  };

  // 📡 LÓGICA DE LA PANTALLA DE NOTIFICACIONES
  const renderAnnunciator = () => {
    if (state.STAT_FAULT || state.FAIL_TERMICO) {
      return (
        <div className={styles.annunciator}>
          <div className={`${styles.msg} ${styles.msgError}`}>🚨 FALLA CRÍTICA DETECTADA</div>
          <div className={`${styles.msg} ${styles.msgError}`}>
            {state.FAIL_TERMICO ? `${'->'} DISYUNTOR TÉRMICO DISPARADO` : `${'->'} FALLA GENERAL DE MOTOR`}
          </div>
        </div>
      );
    }
    if (workflow) {
      return (
        <div className={styles.annunciator}>
          <div className={`${styles.msg} ${styles.msgWarn}`}>⚠️ PENDIENTE DE AUTORIZACIÓN DUAL</div>
          <div className={`${styles.msg} ${styles.msgWarn}`}>
            {workflow.prodApproved ? '✅ PROD OK' : '⏳ ESPERANDO PRODUCCIÓN...'} | 
            {workflow.superApproved ? ' ✅ SUPER OK' : ' ⏳ ESPERANDO SUPERVISOR...'}
          </div>
        </div>
      );
    }
    return (
      <div className={styles.annunciator}>
        <div className={`${styles.msg} ${styles.msgInfo}`}>
          {state.STAT_RUNNING ? '⚙️ MOTOR EN MARCHA' : '⏹️ MOTOR DETENIDO'}
        </div>
        <div className={`${styles.msg} ${styles.msgInfo}`}>
          {`${'->'} SISTEMA LISTO PARA OPERACIÓN`}
        </div>
      </div>
    );

  };

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.faceplate}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h2>{name || id}</h2>
            <div className={styles.modeBadge}>
              {modeStatus === 0 ? 'Modo: LOCAL' : modeStatus === 1 ? 'Modo: REMOTO' : 'Modo: MANTO'}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </header>

        {renderAnnunciator()}

        <div className={styles.mainGrid}>
          {/* COLUMNA 1: CONTROLES */}
          <div className={styles.controlColumn}>
            <div className={styles.sectionBox}>
              <span className={styles.sectionTitle}>SELECCIÓN DE MODO</span>
              <div className={styles.btnGrid}>
                 <button 
                  className={`${styles.modeBtn} ${modeStatus === 0 ? styles.active : ''} ${pendingMode === 0 ? styles.pulsing : ''}`}
                  onClick={() => handleModeChange(0)}
                >LOCAL</button>
                <button 
                  className={`${styles.modeBtn} ${modeStatus === 1 ? styles.active : ''} ${pendingMode === 1 ? styles.pulsing : ''}`}
                  onClick={() => handleModeChange(1)}
                >REMOTO</button>
                {!isMaintenance && (
                  <button className={`${styles.modeBtn} ${requesting ? styles.pulsing : ''}`} onClick={handleRequest}>
                    {requesting ? 'SOLICITANDO...' : 'SOLICITAR MANTO'}
                  </button>
                )}
                {isMaintenance && <button className={`${styles.modeBtn} ${styles.active}`}>EN MANTO</button>}
              </div>
            </div>

            <div className={styles.sectionBox}>
              <span className={styles.sectionTitle}>COMANDOS MANUALES</span>
              <div className={styles.btnRow}>
                <button className={`${styles.cmdBtn} ${styles.start}`} onMouseDown={() => onSendCommand('CMD_FINAL_START', true)} onMouseUp={() => onSendCommand('CMD_FINAL_START', false)}>START</button>
                <button className={`${styles.cmdBtn} ${styles.stop}`} onMouseDown={() => onSendCommand('CMD_FINAL_STOP', true)} onMouseUp={() => onSendCommand('CMD_FINAL_STOP', false)}>STOP</button>
                <button className={`${styles.cmdBtn} ${styles.reset}`} onClick={() => onSendCommand('CMD_FINAL_RESET', true)}>RESET FALLAS</button>
              </div>
            </div>
          </div>

          {/* COLUMNA 2: DIAGNÓSTICO */}
          <div className={styles.diagColumn}>
            <div className={styles.sectionBox}>
              <span className={styles.sectionTitle}>ESTADOS DEL SISTEMA</span>
              <div className={styles.ledRow}>
                <div className={`${styles.led} ${state.STAT_RUNNING ? styles.ledOnSuccess : ''}`} />
                <span className={styles.ledLabel}>Confirmación de Marcha</span>
              </div>
              <div className={styles.ledRow}>
                <div className={`${styles.led} ${state.PERM_TERMICO_OK ? styles.ledOnSuccess : ''}`} />
                <span className={styles.ledLabel}>Permiso Térmico OK</span>
              </div>
              <div className={styles.ledRow}>
                <div className={`${styles.led} ${state.STAT_FAULT ? styles.ledOnDanger : ''}`} />
                <span className={styles.ledLabel}>Falla General</span>
              </div>
              <div className={styles.ledRow}>
                <div className={`${styles.led} ${state.FAIL_TERMICO ? styles.ledOnDanger : ''}`} />
                <span className={styles.ledLabel}>Disparo Térmico</span>
              </div>
            </div>

            <div className={styles.sectionBox}>
               <span className={styles.sectionTitle}>INFORMACIÓN TÉCNICA</span>
               <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '0.8rem' }}>
                  <span>ID TAG: {id}</span>
                  <span>OFFSET: {state._OFFSET || '0.0'}</span>
               </div>
            </div>
          </div>
        </div>

        {/* OVERLAY DE MANTENIMIENTO */}
        {workflow && (
          <div className={styles.maintOverlay}>
             <h3>AUTORIZACIÓN REQUERIDA</h3>
             <p>Por favor, coordine con Producción y Supervisión para otorgar el acceso local al técnico.</p>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
                <button 
                  className={`${styles.modeBtn} ${workflow.prodApproved ? styles.active : ''}`}
                  onClick={() => handleApprove('PROD')}
                >PRODUCCIÓN</button>
                <button 
                   className={`${styles.modeBtn} ${workflow.superApproved ? styles.active : ''}`}
                   onClick={() => handleApprove('SUPER')}
                >SUPERVISOR</button>
             </div>
             <span className={styles.cancelLink} onClick={handleCancel}>CANCELAR SOLICITUD</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MotorFaceplate;

