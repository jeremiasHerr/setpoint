import { useEffect, useState } from 'react';

// Lo que se ve mientras una pantalla espera a la API (decisión 093). Aparece recién a los 200 ms:
// si la respuesta llega antes, no se ve nada, y al recargar ya no parpadea un «Cargando…».
const ESPERA_MS = 200;

type Props = {
  // pagina: una pantalla entera del organizador. lista: las páginas públicas y del jugador.
  // bloque: algo que carga adentro de una pantalla que ya se ve.
  forma?: 'pagina' | 'lista' | 'bloque';
};

function Barra({ className }: { className: string }) {
  return <div className={`rounded-md bg-linea ${className}`} />;
}

export function Esqueleto({ forma = 'pagina' }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const espera = setTimeout(() => setVisible(true), ESPERA_MS);
    return () => clearTimeout(espera);
  }, []);

  // Mientras espera ya ocupa su lugar, invisible: al aparecer no empuja nada.
  return (
    <div role="status" className={`w-full self-stretch motion-safe:animate-pulse ${visible ? '' : 'invisible'}`}>
      <span className="sr-only">Cargando…</span>
      {forma === 'pagina' && (
        <div aria-hidden className="flex flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            <Barra className="h-8 w-72 max-w-full" />
            <Barra className="h-4 w-[420px] max-w-full" />
          </div>
          <div className="flex flex-col gap-[18px] rounded-superficie border border-linea-suave p-5">
            {['w-2/5', 'w-1/3', 'w-1/2', 'w-1/4'].map((ancho) => (
              <div key={ancho} className="flex items-center justify-between gap-4">
                <Barra className={`h-4 ${ancho}`} />
                <Barra className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      )}
      {forma === 'lista' && (
        <div aria-hidden className="flex flex-col gap-3.5">
          <Barra className="h-7 w-52 max-w-full" />
          <div className="flex flex-col rounded-tarjeta border border-linea-suave">
            {[0, 1, 2, 3, 4].map((fila) => (
              <div key={fila} className="flex items-center gap-3 border-b border-linea-suave px-4 py-3.5 last:border-b-0">
                <Barra className="size-5 rounded-full" />
                <Barra className="h-4 flex-1" />
                <Barra className="h-4 w-10" />
              </div>
            ))}
          </div>
        </div>
      )}
      {forma === 'bloque' && (
        <div aria-hidden className="flex flex-col gap-2.5">
          <Barra className="h-4 w-3/5" />
          <Barra className="h-4 w-2/5" />
        </div>
      )}
    </div>
  );
}
