'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to handle dashed line animation for flow simulation.
 * 
 * @param active If true, the animation starts. If false, it stays static.
 * @param speed Movement speed of the dash offset.
 * @returns The current offset for the dash.
 */
export const useFlowAnimation = (active: boolean, speed: number = 2) => {
  const [offset, setOffset] = useState(0);
  const requestRef = useRef<number | undefined>(undefined);

  const animate = (time: number) => {
    setOffset((prev) => (prev - speed) % 100);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (active) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      // Si se detiene, podemos resetear a 0 o dejarlo donde está
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [active, speed]);

  return offset;
};
