'use client';

import React from 'react';
import styles from './Motor.module.css';
import { StatusBadge, StatusType } from '../StatusBadge/StatusBadge';

interface MotorProps {
  id: string;
  name: string;
  status: StatusType | 'idle';
  rpm?: number;
  current?: number;
  onClick?: () => void;
}

export const Motor: React.FC<MotorProps> = ({ id, name, status, rpm = 0, current = 0, onClick }) => {
  return (
    <div className={`${styles.motorCard} glass`} onClick={onClick}>
      <div className={styles.header}>
        <span className={styles.id}>{id}</span>
        <StatusBadge status={status === 'idle' ? 'stopped' : (status as StatusType)} />
      </div>

      <div className={styles.visualContainer}>
        {/* Dibujo simple del motor en SVG */}
        <svg viewBox="0 0 100 60" className={`${styles.motorSvg} ${styles[status]}`}>
          <rect x="20" y="10" width="60" height="40" rx="4" className={styles.body} />
          <rect x="80" y="25" width="10" height="10" className={styles.shaft} />
          <path d="M25 10 V50 M35 10 V50 M45 10 V50 M55 10 V50" className={styles.fins} />
          <rect x="35" y="5" width="30" height="10" className={styles.terminalBox} />
        </svg>
        
        {status === 'running' && <div className={styles.rotationPulse} />}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.label}>VELOCIDAD</span>
            <span className={styles.value}>{rpm} <small>RPM</small></span>
          </div>
          <div className={styles.metric}>
            <span className={styles.label}>CORRIENTE</span>
            <span className={styles.value}>{current.toFixed(1)} <small>A</small></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Motor;

