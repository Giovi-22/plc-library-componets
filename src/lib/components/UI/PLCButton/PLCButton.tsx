import React from 'react';
import styles from './PLCButton.module.css';

export type ButtonVariant = 'primary' | 'success' | 'danger' | 'warning' | 'default';

interface PLCButtonProps {
  label: string;
  variant?: ButtonVariant;
  active?: boolean;
  pulsing?: boolean;
  onClick?: () => void;
  onPress?: (active: boolean) => void; // Para pulsos (Start/Stop)
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export const PLCButton: React.FC<PLCButtonProps> = ({
  label,
  variant = 'default',
  active = false,
  pulsing = false,
  onClick,
  onPress,
  disabled = false,
  className = '',
  fullWidth = false,
}) => {
  
  const handleMouseDown = () => {
    if (onPress && !disabled) {
      onPress(true);
    }
  };

  const handleMouseUp = () => {
    if (onPress && !disabled) {
      onPress(false);
    }
  };

  // Por seguridad, si el mouse sale del botón, liberamos el pulso
  const handleMouseLeave = () => {
    if (onPress && !disabled) {
      onPress(false);
    }
  };

  const combinedClasses = [
    styles.plcBtn,
    variant !== 'default' ? styles[variant] : '',
    active ? styles.activeMode : '',
    pulsing ? styles.pulsing : '',
    fullWidth ? styles.fullWidth : '',
    className
  ].join(' ').trim();

  return (
    <button
      className={combinedClasses}
      onClick={!onPress ? onClick : undefined}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default PLCButton;
