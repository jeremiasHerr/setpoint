import { useEffect, useState } from 'react';

// "09:12" que baja cada segundo hasta que vence la reserva.
export function useCuentaRegresiva(vence: string | null) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, []);
  if (!vence) return null;
  const segundos = Math.max(0, Math.floor((new Date(vence).getTime() - ahora) / 1000));
  return `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;
}
