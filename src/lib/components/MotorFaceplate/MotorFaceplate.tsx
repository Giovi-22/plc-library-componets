'use client';

import React, { useState } from 'react';
import styles from './MotorFaceplate.module.css';
import { API_URL } from '@/lib/config';
import { PLCButton } from '../UI/PLCButton/PLCButton';
import { StatusLed } from '../UI/StatusLed/StatusLed';

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
    await fetch(`${API_URL}/devices/${id}/maintenance/request`, { method: 'POST' });
    setTimeout(() => setRequesting(false), 2000);
  };

  const handleApprove = async (role: 'PROD' | 'SUPER') => {
    await fetch(`${API_URL}/devices/${id}/maintenance/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
  };

  const handleCancel = async () => {
    await fetch(`${API_URL}/devices/${id}/maintenance/cancel`, { method: 'POST' });
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
              {modeStatus === 0 ? 'Modo: LOCAL' : 
               modeStatus === 1 ? 'Modo: REMOTO' : 
               modeStatus === 2 ? 'Modo: MANTO' : 
               'Modo: AUTOMÁTICO'}
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
                <PLCButton 
                  label="LOCAL"
                  active={modeStatus === 0}
                  pulsing={pendingMode === 0}
                  onClick={() => handleModeChange(0)}
                />
                <PLCButton 
                  label="REMOTO"
                  active={modeStatus === 1}
                  pulsing={pendingMode === 1}
                  onClick={() => handleModeChange(1)}
                />
                <PLCButton 
                  label="AUTOMÁTICO"
                  active={modeStatus === 3}
                  pulsing={pendingMode === 3}
                  onClick={() => handleModeChange(3)}
                />
                {/* Botones de mantenimiento ocultos por ahora según solicitud usuario */}
                {/* !isMaintenance && (
                  <PLCButton 
                    label={requesting ? 'SOLICITANDO...' : 'SOLICITAR MANTO'}
                    pulsing={requesting}
                    onClick={handleRequest}
                  />
                ) */}
                {isMaintenance && <PLCButton label="EN MANTO" active />}
              </div>
            </div>

            <div className={styles.sectionBox}>
              <span className={styles.sectionTitle}>COMANDOS MANUALES</span>
              <div className={styles.btnRow}>
                <PLCButton 
                  label="START" 
                  variant="success" 
                  onPress={(active) => onSendCommand('CMD_FINAL_START', active)} 
                />
                <PLCButton 
                  label="STOP" 
                  variant="danger" 
                  onPress={(active) => onSendCommand('CMD_FINAL_STOP', active)} 
                />
                <PLCButton 
                  label="RESET FALLAS" 
                  variant="warning" 
                  onClick={() => onSendCommand('CMD_FINAL_RESET', true)} 
                  fullWidth
                />
              </div>
            </div>
          </div>

          {/* COLUMNA 2: DIAGNÓSTICO */}
          <div className={styles.diagColumn}>
            <div className={styles.sectionBox}>
              <span className={styles.sectionTitle}>ESTADOS DEL SISTEMA</span>
                <StatusLed label="Confirmación de Marcha" isOn={state.STAT_RUNNING} color="green" />
                <StatusLed label="Permiso Térmico OK" isOn={state.PERM_TERMICO_OK} color="green" />
                <StatusLed label="Falla General" isOn={state.STAT_FAULT} color="red" />
                <StatusLed label="Disparo Térmico" isOn={state.FAIL_TERMICO} color="red" />
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

        {/* OVERLAY DE MANTENIMIENTO oculto por ahora */}
        {/* workflow && (
          <div className={styles.maintOverlay}>
             <h3>AUTORIZACIÓN REQUERIDA</h3>
             ...
          </div>
        ) */}
      </div>
    </div>
  );
};

export default MotorFaceplate;

