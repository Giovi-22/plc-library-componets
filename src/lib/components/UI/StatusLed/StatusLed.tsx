import React from 'react';
import styles from './StatusLed.module.css';

export type LedColor = 'green' | 'red' | 'yellow' | 'blue';

interface StatusLedProps {
  label: string;
  isOn?: boolean;
  color?: LedColor;
  className?: string;
}

export const StatusLed: React.FC<StatusLedProps> = ({
  label,
  isOn = false,
  color = 'green',
  className = '',
}) => {
  
  const getLedClass = () => {
    if (!isOn) return styles.led;
    switch (color) {
      case 'red': return `${styles.led} ${styles.onRed}`;
      case 'yellow': return `${styles.led} ${styles.onYellow}`;
      case 'blue': return `${styles.led} ${styles.onBlue}`;
      default: return `${styles.led} ${styles.onGreen}`;
    }
  };

  return (
    <div className={`${styles.ledContainer} ${className}`}>
      <div className={getLedClass()} />
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default StatusLed;
