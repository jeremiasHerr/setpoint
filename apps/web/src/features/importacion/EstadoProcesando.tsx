import { useEffect, useState } from 'react';
import { BarraProgreso } from '../../components/BarraProgreso';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';

// Lo que suele tardar una planilla de un circuito como POLENTA. Si hay que reintentar, más.
const SEGUNDOS_ESTIMADOS = 30;

export function EstadoProcesando({ archivo }: { archivo: string }) {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <Tarjeta className="flex max-w-[560px] flex-col gap-4 p-[22px]" aria-live="polite">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[17px] font-semibold">Leyendo {archivo}</h2>
        <p className="text-[15px] leading-normal text-gris-500">
          La IA interpreta cada fila: qué columna es cada etapa, quién es cada jugador y si ya está en tu padrón.
          Después se revisa cada número contra el archivo, para que no entre ninguno que no esté en la planilla.
        </p>
      </div>
      {/* No hay avance real que medir: la barra marca el tiempo y se queda cerca del final. */}
      <BarraProgreso valor={Math.min(segundos, SEGUNDOS_ESTIMADOS * 0.95)} total={SEGUNDOS_ESTIMADOS} rotulo="Tiempo de lectura" />
      <p className="text-sm text-gris-500">
        <Numero>{segundos}</Numero> s · suele tardar menos de un minuto. No cierres esta pestaña.
      </p>
    </Tarjeta>
  );
}
