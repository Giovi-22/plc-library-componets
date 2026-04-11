'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '@/lib/config';

interface DeviceData {
  id: string;
  type: string;
  state: any;
}

export const usePLCData = () => {
  const [data, setData] = useState<Record<string, DeviceData>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('deviceUpdate', (updatedDevice: DeviceData) => {
      setData((prev) => ({
        ...prev,
        [updatedDevice.id]: updatedDevice
      }));
    });

    // Carga inicial (Opcional: podríamos hacer un fetch a /devices si quisiéramos)
    
    return () => {
      socket.disconnect();
    };
  }, []);

  return { data, isConnected };
};
