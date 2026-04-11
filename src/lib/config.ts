const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const customIp = localStorage.getItem('SCADA_SERVER_IP');
    if (customIp) {
      return `http://${customIp}:3001`; // Mantiene el puerto 3001 por diseño
    }
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return 'http://localhost:3001';
};


export const API_URL = getBaseUrl();
export const SOCKET_URL = getBaseUrl();

// GRID CONFIGURATION
export const GRID_SIZE = 20;

export const snapToGrid = (value: number) => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};
