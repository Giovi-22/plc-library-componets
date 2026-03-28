import React from 'react';
import styles from './StatusBadge.module.css';

export type StatusType = 'running' | 'stopped' | 'fault' | 'warning' | 'idle' | 'online' | 'offline';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const getStatusLabel = () => {
    if (label) return label;
    switch (status) {
      case 'running': return 'En Marcha';
      case 'stopped': return 'Detenido';
      case 'fault': return 'Falla';
      case 'warning': return 'Advertencia';
      case 'idle': return 'Espera';
      case 'online': return 'ONLINE';
      case 'offline': return 'OFFLINE';
      default: return 'Desconocido';
    }
  };


  return (
    <div className={`${styles.badge} ${styles[status]}`}>
      <span className={`${styles.dot} ${styles[status]}`} />
      <span className={styles.text}>{getStatusLabel()}</span>
    </div>
  );
};

export default StatusBadge;

