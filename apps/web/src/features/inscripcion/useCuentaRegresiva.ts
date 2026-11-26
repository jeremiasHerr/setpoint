import { useEffect, useRef, useState } from 'react';

// "09:12" que baja cada segundo hasta que vence la reserva. Al llegar a cero avisa una sola vez.
export function useCuentaRegresiva(vence: string | null, alVencer?: () => void) {
  const [ahora, setAhora] = useState(() => Date.now());
  const alVencerRef = useRef(alVencer);
  const avisadoPara = useRef<string | null>(null);

  useEffect(() => {
    alVencerRef.current = alVencer;
  }, [alVencer]);

  const segundos = vence ? Math.max(0, Math.floor((new Date(vence).getTime() - ahora) / 1000)) : null;
  const vencida = segundos === 0;

  useEffect(() => {
    if (!vence || vencida) return;
    const intervalo = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, [vence, vencida]);

  useEffect(() => {
    if (!vence || !vencida || avisadoPara.current === vence) return;
    avisadoPara.current = vence;
    // Pequeño margen para que el reloj del servidor ya considere vencida la reserva.
    const espera = setTimeout(() => alVencerRef.current?.(), 500);
    return () => clearTimeout(espera);
  }, [vence, vencida]);

  if (segundos === null) return null;
  return `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;
}
