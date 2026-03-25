import React from 'react';
import styles from './Motor.module.css';
import { StatusBadge, StatusType } from '../StatusBadge/StatusBadge';

interface MotorProps {
  id: string;
  name: string;
  status: StatusType;
  rpm?: number;
  current?: number; // Amperes
  onStart?: () => void;
  onStop?: () => void;
}

export const Motor: React.FC<MotorProps> = ({ id, name, status, rpm = 0, current = 0, onStart, onStop }) => {
  const isRunning = status === 'running';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.id}>{id}</span>
        <h3 className={styles.title}>{name}</h3>
        <StatusBadge status={status} />
      </div>

      <div className={styles.visual}>
        <div className={`${styles.motorBody} ${isRunning ? styles.spinning : ''}`}>
          <div className={styles.shaft} />
          <div className={styles.fins}>
            <div className={styles.fin} />
            <div className={styles.fin} />
            <div className={styles.fin} />
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Velocidad</span>
          <span className={styles.statValue}>{rpm} <small>RPM</small></span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Consumo</span>
          <span className={styles.statValue}>{current.toFixed(1)} <small>A</small></span>
        </div>
      </div>

      <div className={styles.controls}>
        <button 
          className={`${styles.button} ${styles.startBtn}`}
          onClick={onStart}
          disabled={isRunning || status === 'fault'}
        >
          START
        </button>
        <button 
          className={`${styles.button} ${styles.stopBtn}`}
          onClick={onStop}
          disabled={!isRunning}
        >
          STOP
        </button>
      </div>
    </div>
  );
};
