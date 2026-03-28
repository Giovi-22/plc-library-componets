// Si estás en el cliente, usa la IP actual. De lo contrario, usa localhost como fallback.
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return 'http://localhost:3001';
};


export const API_URL = getBaseUrl();
export const SOCKET_URL = getBaseUrl();
